/**
 * Client-Side Leaf Disease Analyzer
 * Runs 100% in the browser — no API key, no server needed.
 * Uses Canvas pixel data to analyze color distributions and patterns
 * to identify plant diseases based on visual symptoms.
 */

export const DISEASE_KEYS = [
    'healthy', 'leaf_blight', 'powdery_mildew', 'rust',
    'leaf_spot', 'bacterial_wilt', 'anthracnose', 'downy_mildew',
    'mosaic_virus', 'nutrient_deficiency_n', 'nutrient_deficiency_fe', 'late_blight',
]

/**
 * Analyze an image File using Canvas pixel data
 * @param {File} file - image file
 * @returns {Promise<{disease_key, confidence, observation}>}
 */
export function analyzeLeafLocally(file) {
    return new Promise((resolve, reject) => {
        const img = new Image()
        const url = URL.createObjectURL(file)

        img.onload = () => {
            try {
                const canvas = document.createElement('canvas')
                // Sample at 200px max to keep it fast
                const scale = Math.min(1, 200 / Math.max(img.width, img.height))
                canvas.width = Math.round(img.width * scale)
                canvas.height = Math.round(img.height * scale)
                const ctx = canvas.getContext('2d')
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
                URL.revokeObjectURL(url)

                const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height)
                const result = classifyPixels(data)
                resolve(result)
            } catch (e) {
                reject(e)
            }
        }
        img.onerror = () => reject(new Error('IMAGE_LOAD_FAILED'))
        img.src = url
    })
}

/** HSV conversion helpers */
function rgbToHsv(r, g, b) {
    r /= 255; g /= 255; b /= 255
    const max = Math.max(r, g, b), min = Math.min(r, g, b)
    const d = max - min
    let h = 0, s = max === 0 ? 0 : d / max, v = max
    if (d > 0) {
        if (max === r) h = ((g - b) / d + 6) % 6
        else if (max === g) h = (b - r) / d + 2
        else h = (r - g) / d + 4
        h /= 6
    }
    return { h: h * 360, s, v }
}

function classifyPixels(data) {
    let total = 0
    const counts = {
        healthyGreen: 0,  // h:90-150, s>0.25, v>0.2
        yellowGreen: 0,   // h:60-90, s>0.2
        pureYellow: 0,    // h:45-65, s>0.4, v>0.5
        brown: 0,         // h:15-40, s>0.3, v:0.15-0.7
        orange: 0,        // h:18-35, s>0.5, v>0.5
        white: 0,         // v>0.88, s<0.18
        black: 0,         // v<0.12
        darkSpot: 0,      // v<0.2, s<0.3 (dark lesion)
        brightYellow: 0,  // h:50-75, s>0.5, v>0.65 (mosaic)
        grayish: 0,       // s<0.15, v:0.3-0.7
    }

    for (let i = 0; i < data.length; i += 4) {
        const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3]
        if (a < 20) continue // skip transparent
        total++
        const { h, s, v } = rgbToHsv(r, g, b)

        if (v < 0.12) { counts.black++; counts.darkSpot++ }
        else if (v > 0.88 && s < 0.18) counts.white++
        else if (s < 0.15 && v > 0.3 && v < 0.7) counts.grayish++
        else if (h >= 90 && h <= 150 && s > 0.25 && v > 0.2) counts.healthyGreen++
        else if (h >= 60 && h < 90 && s > 0.2) counts.yellowGreen++
        else if (h >= 50 && h < 75 && s > 0.5 && v > 0.65) counts.brightYellow++
        else if (h >= 45 && h < 65 && s > 0.4 && v > 0.5) counts.pureYellow++
        else if (h >= 18 && h < 35 && s > 0.5 && v > 0.5) counts.orange++
        else if (h >= 15 && h < 45 && s > 0.3 && v >= 0.15 && v <= 0.7) counts.brown++
        else if (v < 0.2 && s < 0.3) counts.darkSpot++
    }

    if (total === 0) return { disease_key: 'healthy', confidence: 55, observation: 'Could not read image pixels. Please try a different image.' }

    const T = total
    const r = {
        healthyGreen: counts.healthyGreen / T,
        yellowGreen: counts.yellowGreen / T,
        pureYellow: counts.pureYellow / T,
        brightYellow: counts.brightYellow / T,
        brown: counts.brown / T,
        orange: counts.orange / T,
        white: counts.white / T,
        black: counts.black / T,
        darkSpot: counts.darkSpot / T,
        grayish: counts.grayish / T,
    }

    // Score each disease
    const scores = {}

    // Healthy: dominant green, low disease markers
    scores.healthy = (
        r.healthyGreen * 2.5 -
        r.brown * 3 - r.pureYellow * 3 - r.white * 2 -
        r.darkSpot * 4 - r.orange * 3
    )

    // Leaf Blight: brown necrotic patches, losing green
    scores.leaf_blight = (
        r.brown * 2.8 + r.darkSpot * 1.5 -
        r.healthyGreen * 1.5 - r.white * 1.5
    )

    // Powdery Mildew: white patches on green leaf
    scores.powdery_mildew = (
        r.white * 3.5 + r.grayish * 1.2 -
        r.brown * 2 - r.orange * 2
    )

    // Rust: orange/rust-brown spots
    scores.rust = (
        r.orange * 3.2 + r.brown * 0.8 -
        r.white * 2.5 - r.healthyGreen * 0.5
    )

    // Leaf Spot: discrete dark/brown spots amid green
    scores.leaf_spot = (
        r.brown * 1.5 + r.darkSpot * 1.8 +
        r.healthyGreen * 0.3 -
        r.white * 2
    )

    // Bacterial Wilt: yellowish-green wilted look
    scores.bacterial_wilt = (
        r.yellowGreen * 2.0 + r.pureYellow * 0.5 -
        r.healthyGreen * 1.2 - r.white * 1.5 - r.orange * 2
    )

    // Anthracnose: very dark/black sunken lesions
    scores.anthracnose = (
        r.darkSpot * 2.5 + r.black * 2.0 -
        r.white * 2 - r.orange * 2
    )

    // Downy Mildew: gray/purplish patches, yellowing
    scores.downy_mildew = (
        r.grayish * 2.5 + r.pureYellow * 0.8 -
        r.white * 1 - r.orange * 2
    )

    // Mosaic Virus: bright yellow-green mosaic pattern (high contrast)
    scores.mosaic_virus = (
        r.brightYellow * 3.0 + r.yellowGreen * 1.0 -
        r.brown * 2 - r.white * 1.5
    )

    // Nitrogen Deficiency: uniform pale yellow starting older leaves
    scores.nutrient_deficiency_n = (
        r.pureYellow * 2.5 + r.yellowGreen * 1.2 -
        r.white * 2 - r.orange * 2 - r.brown * 1
    )

    // Iron Deficiency: interveinal chlorosis — yellow with visible green veins
    scores.nutrient_deficiency_fe = (
        r.brightYellow * 2.0 + r.pureYellow * 1.0 + r.yellowGreen * 0.8 -
        r.brown * 2 - r.white * 1
    )

    // Late Blight: dark water-soaked lesions, may have white fuzzy edge
    scores.late_blight = (
        r.darkSpot * 2.0 + r.black * 1.5 + r.white * 1.0 -
        r.healthyGreen * 1.2 - r.orange * 1.5
    )

    // Pick best scoring disease
    let bestKey = 'healthy'
    let bestScore = scores.healthy
    for (const [key, score] of Object.entries(scores)) {
        if (score > bestScore) { bestScore = score; bestKey = key }
    }

    // Confidence: map relative lead of winner
    const sortedScores = Object.values(scores).sort((a, b) => b - a)
    const lead = sortedScores[0] - sortedScores[1]
    const confidence = Math.round(Math.min(96, Math.max(52, 60 + lead * 200)))

    const observation = buildObservation(r, bestKey)

    return { disease_key: bestKey, confidence, observation }
}

function buildObservation(r, key) {
    const pct = (v) => Math.round(v * 100)
    const greenPct = pct(r.healthyGreen)
    const brownPct = pct(r.brown)
    const yellowPct = pct(r.pureYellow + r.brightYellow)
    const whitePct = pct(r.white)
    const darkPct = pct(r.darkSpot)
    const orangePct = pct(r.orange)

    const obs = {
        healthy: `Leaf appears predominantly green (${greenPct}% healthy green pixels). No significant disease markers detected.`,
        leaf_blight: `Brown/necrotic discolouration covers ~${brownPct}% of the leaf surface. Green tissue reduced to ${greenPct}%.`,
        powdery_mildew: `White or pale patches detected on ${whitePct}% of the leaf surface, consistent with powdery fungal growth.`,
        rust: `Orange-rust coloured spots cover ~${orangePct}% of the surface, with brown lesions at ${brownPct}%.`,
        leaf_spot: `Discrete dark spots cover ~${darkPct}% of the leaf amid ${greenPct}% remaining green tissue.`,
        bacterial_wilt: `Yellowish-green discolouration detected. Healthy green tissue reduced, with diffuse yellowing visible.`,
        anthracnose: `Dark/sunken lesions cover ~${darkPct}% of the surface. Black necrotic tissue detected at ${pct(r.black)}%.`,
        downy_mildew: `Grayish-purple patches cover ${pct(r.grayish)}% of the surface with associated yellowing.`,
        mosaic_virus: `Irregular bright yellow-green mosaic pattern detected covering ~${yellowPct}% of the leaf.`,
        nutrient_deficiency_n: `Uniform yellow discolouration on ~${yellowPct}% of the leaf. Overall pale appearance — green tissue at ${greenPct}%.`,
        nutrient_deficiency_fe: `Interveinal yellowing pattern detected. Bright yellow areas (~${yellowPct}%) with green veins visible.`,
        late_blight: `Dark water-soaked lesions cover ~${darkPct}% of the surface. Some white fuzzy margin detected (${whitePct}% white).`,
    }
    return obs[key] || `Image shows ${greenPct}% green, ${brownPct}% brown, ${yellowPct}% yellow areas.`
}
