import {env} from "../env";

export async function readFileAsBase64(file: File | undefined): Promise<string> {
	return new Promise((resolve, reject) => {
		if (file) {
			const reader = new FileReader();
			reader.onload = function(e) {
				if (e.target) {
					resolve(e.target.result as string); // Resolve the promise with the base64 string
				} else {
					resolve('');
				}
			};
			reader.onerror = function() {
				resolve('');
			};
			reader.readAsDataURL(file);
		} else {
			resolve('');
		}
	});
}

export const fetchFile = async (
	authToken: string | undefined,
	path: string
): Promise<any> => {
	const response =
		await fetch(`${env().REACT_APP_GRAPHQL_ENDPOINT_URL}/files/`, {
			headers: {
				accept: '*/*',
				'content-type': 'application/json',
				authorization: `Bearer ${authToken}`,
			},
			body: JSON.stringify({
				filePath: path
			}),
			method: 'POST',
			mode: 'cors',
			credentials: 'omit',
		})

	if (!response.ok) {
		console.error('Error fetching file:', response.statusText);
		return { status: response.status, data: null };
	}

	const blob = await response.blob();
	const downloadUrl = window.URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.href = downloadUrl;
	link.download = path.split('/').pop() || 'download';
	document.body.appendChild(link);
	link.click();
	link.remove();

	return { status: response?.status, data: {} };
}
