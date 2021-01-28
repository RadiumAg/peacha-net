export async function loadByte(path: string): Promise<ArrayBuffer> {
    if (!window.fetch) {
        return await loadByteXML(path);
    }
    const data = await fetch(path, {
        mode: 'cors'
    });
    return await data.arrayBuffer();
}

export function loadByteXML(path: string): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
        const request = new XMLHttpRequest();
        request.open('GET', path, true);
        request.responseType = 'arraybuffer';
        request.onload = () => {
            switch (request.status) {
            case 200:
                resolve(request.response);
                break;
            default:
                reject('Failed to load (' + request.status + ') : ' + path);
                break;
            }
        };
        request.send(null);
    });
}
