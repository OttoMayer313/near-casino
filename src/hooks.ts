import * as cookie from 'cookie';

export function getSession(event: any) {
    const cookieStr = event.request.headers.get("cookie");
    const cookies = cookie.parse(cookieStr || '');
    const authCookie = cookies[`a_session_${import.meta.env.VITE_APPWRITE_PROJECT_ID.toLowerCase()}_legacy`];

    console.log(cookieStr);
    console.log(authCookie);

    return {
        authCookie
    }
}