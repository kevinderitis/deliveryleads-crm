import AccessLog from './models/accessLog.js';

export const logAccess = async (accessData) => {
    try {
        const accessLog = new AccessLog(accessData);
        await accessLog.save();
        console.log("Acceso registrado correctamente.");
    } catch (error) {
        console.error("Error al registrar el acceso: ", error);
        throw error;
    }
};