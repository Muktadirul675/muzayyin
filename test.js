// id APdRO9zeGy
// secret J2yKUgbz8zUGFnymtTy3fScdIcnzJlDZsofXcU9h
// https://api-hermes.pathao.com

const baseUrl = 'https://api-hermes.pathao.com';
const clientId = 'APdRO9zeGy';
const clientSecret = 'J2yKUgbz8zUGFnymtTy3fScdIcnzJlDZsofXcU9h';
const username = 'muktadirul.05@gmail.com';
const password = 'itsmeand..A1';
const accessToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI5MjcyIiwianRpIjoiYmQ1YWQ4MTM3Nzc5YjU2NDAxZWIxYTViMmY1NWY3MDMyMjdiMzdkMjczYmNmODgxNTA0ZjVmZWE0YWYwMDk4YWNiMDFhY2VkNTNkNGVhMTkiLCJpYXQiOjE3Mzc1MzYzNzMuNzA4NzgyLCJuYmYiOjE3Mzc1MzYzNzMuNzA4Nzg3LCJleHAiOjE3NDUzMTIzNzMuNjk1NzEsInN1YiI6IjI3NDkxNiIsInNjb3BlcyI6W119.eMxAVtwQMfGrMd0DJ2knYX_zGes9ypugLvlGbSmeaauBNuWtBfcNFiFQfufORd8WTv7Iw-EAROXRC0VpdY4oYF0SdPgwIE-outmEIQsZDlqGctCJlSKMjynDrPHW8ghosdIWXxjknrSvPixJhdZlghUW9-J6clSUAAh-mC6mghom4jMpDWFy9t_ITO6P3JqJ4qSpJdkDibKIm1plU_kCGgYKTw8Ld-phL_RLoXUlGtZcvMXmv3DxLdappouwVYmMV6uhqNSmtLywCElb_oznftDrAUA9Pn_c03qvO9wWLimrD1-Ut2JQIZ-wzVnRg0YOiA9X24IImDESctP7eG-IcqkDzgAV0HyYtPMQHUg-D9p5i-uj69LDFqw87tdNt5Tou0UuN2VNV3XORXEVgVOXQbSjF0qN6kMn3d4MXAyf0Uhu0k0HbFe0qaWtFw52n0St-CzMHKJPWPZ4nTtbgBoQuwBzlaNDWYrAyRLGmef4le81vVUnh2Qlag03VhQxbikpd7mWzt7kXPEYsfj2Pt7y7GbwxkrFnyMWjIIx-0-VORoqpt3gMqKOVJoWu4PbpavJVlx4qo6N2djGnVa-Ku1ccpb6Y8dZF-Bdjv145Fy2RIYkJWg4z7qvND8HnQsjQeYFCWMKWopmjw6fYnd_ZNyVJeKrF_E28Y11TVC3Chwbndg"

fetch(`${baseUrl}/stores`, {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
    }
})
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => console.log('Stores Response:', data))
    .catch(error => console.error('Error:', error));