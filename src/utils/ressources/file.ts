import {env} from "../env";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

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
		await fetch(`${env().REACT_APP_ENDPOINT_URL}/files/`, {
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
	window.open(downloadUrl, '_blank');
	// Optional: If user wants to download it with a correct name
	/*const link = document.createElement('a');
	link.href = downloadUrl;
	link.download = path.split('/').pop() || 'download';
	document.body.appendChild(link);
	link.click();
	link.remove();*/

	return { status: response?.status, data: {} };
}

export const handleClickFileLink = async (event: any, token: string | undefined, filePath: string) => {
	if (!event.defaultPrevented) {
		event.preventDefault();
		await fetchFile(
			token,
			filePath
		);
	}
};

export function exportToExcel(data: any, fileName = 'export.xlsx') {
	// Convert JSON to worksheet
	const worksheet = XLSX.utils.json_to_sheet(data);

	// Create a new workbook and append the worksheet
	const workbook = XLSX.utils.book_new();
	XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

	// Write workbook to binary array
	const excelBuffer = XLSX.write(workbook, {
		bookType: 'xlsx',
		type: 'array',
	});

	// Create a Blob and trigger download
	const dataBlob = new Blob([excelBuffer], { type: 'application/octet-stream' });
	saveAs(dataBlob, fileName);
}
