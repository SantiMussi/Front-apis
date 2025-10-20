
export const STATUS_ALIASES = {
    PENDIENTE: ["PENDIENTE", "PENDING", "PEND"],
    EN_PROGRESO: ["EN_PROGRESO", "EN PROGRESO", "IN_PROGRESS", "PROCESSING"],
    ENVIADO: ["ENVIADO", "SENT", "SHIPPED"],
    COMPLETADO: ["COMPLETADO", "COMPLETED", "FINALIZADO", "DONE"],
};

export const CANON_STATES = Object.keys(STATUS_ALIASES);

export function normalizeStatusToken(raw){
    const tok = (raw ?? "").toString().trim().toUpperCase().replace(/\s+/g, "_");
    for(const canon of CANON_STATES){
        if(STATUS_ALIASES[canon].includes(tok)) return canon;
    }

    return tok; //Fallback
}