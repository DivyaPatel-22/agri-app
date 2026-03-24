import React from 'react'
import { useTranslation } from 'react-i18next'

export default function AlertBanner({ alerts, onDismiss }) {
    const { t } = useTranslation()
    if (!alerts || alerts.length === 0) return null

    return (
        <div className="alert-banner-list">
            {alerts.map(alert => (
                <div key={alert.id} className={`alert-item alert-${alert.type}`}>
                    <span>{alert.icon}</span>
                    <span>{t(`alerts.${alert.type}`)}</span>
                    <button className="alert-dismiss" onClick={() => onDismiss(alert.id)}>✕</button>
                </div>
            ))}
        </div>
    )
}
