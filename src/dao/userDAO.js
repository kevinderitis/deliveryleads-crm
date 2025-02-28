import User from "./models/userModel.js";

const getUserByEmail = async (email) => {
    try {
        const user = await User.findOne({ email });
        if (!user) {
            console.log('Cliente no encontrado-')
        }
        return user;
    } catch (error) {
        console.error('Error al obtener usuario por correo electrónico:', error.message);
        throw new Error('No se pudo encontrar el usuario');
    }
};

const getAdminPhones = async () => {
    try {
        const user = await User.findOne({ rol: "admin" });
        if (!user) {
            console.log('Cliente no encontrado')
        }
        let phones = {
            phone1: user.phone1,
            phone2: user.phone2,
            phone3: user.phone3,
            phone4: user.phone4
        };

        return phones;
    } catch (error) {
        console.error('Error al obtener usuario por correo electrónico:', error.message);
        throw new Error('No se pudo encontrar el usuario');
    }
}

export { getUserByEmail, getAdminPhones };