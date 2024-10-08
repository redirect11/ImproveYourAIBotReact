// Constants.js
const prod = {
    url: {
        API_URL: 'https://myapp.herokuapp.com',
    }
};
const dev = {
    url: {
        API_URL: 'http://localhost'
    }
};
export const config = process.env.NODE_ENV === 'development' ? dev : prod;