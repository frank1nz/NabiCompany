import api from './axios'


export async function login(data) {
const res = await api.post('/auth/login', data)
return res.data // expect { token, user? }
}


export async function register(data) {
const res = await api.post('/auth/register', data)
return res.data
}


export async function me() {
const res = await api.get('/auth/me')
return res.data // expect { id, name, email, role, verified?, kycStatus? }
}