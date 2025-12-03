import {env} from "../env";
import { saveAs } from 'file-saver';
import {splitCamelCase} from "./jsonUtils";
import * as XLSX from 'xlsx-js-style';

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

const fetchFile = async (
	authToken: string | undefined,
	id: string,
	model: string,
	fileName: string
): Promise<any> => {
	const keys: any = JSON.parse(id);
	let url = `${env().REACT_APP_ENDPOINT_URL}/files/${model}/${encodeURIComponent(keys.eph_id)}?salt=${keys.salt}&fileName=${fileName}`;
	if (model === 'organismByFormIO') {
		url = `${env().REACT_APP_ENDPOINT_URL}/files/${model}/${id}`;
	}
	const response =
		await fetch(url, {
			headers: {
				accept: '*/*',
				'content-type': 'application/json',
				authorization: `Bearer ${authToken}`,
			},
			method: 'GET',
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

export const handleClickFileLink = async (event: any, token: string | undefined, id: string, model: string, fileName: string = '') => {
	if (!event.defaultPrevented) {
		event.preventDefault();
		await fetchFile(
			token,
			id,
			model,
			fileName
		);
	}
};

export function exportToExcel(data: any, fileName = 'export.xlsx') {
	const allKeys = Array.from(
		new Set(data.flatMap((obj: {}) => Object.keys(obj)))
	);

	const renamedData = data.map((item: { [x: string]: any; }) => {
		const newObject: Record<string, any> = {};

		for (const key of allKeys) {
			const label = splitCamelCase(key);
			newObject[label] = key in item ? checkType(item[key]) : null;
		}

		return newObject;
	});

	// Convert JSON to worksheet
	const worksheet = XLSX.utils.json_to_sheet(renamedData);

	const headers = Object.keys(renamedData[0]);
	worksheet['!cols'] = headers.map(() => ({ wch: 18 }));

	headers.forEach((_, colIdx) => {
		const cellRef = XLSX.utils.encode_cell({ r: 0, c: colIdx });
		const cell = worksheet[cellRef];
		if (cell) {
			cell.s = {
				font: { bold: true },
				alignment: { wrapText: true, vertical: 'top', horizontal: 'left' }
			};
		}
	});

	// Apply wrapText to every cell
	Object.keys(worksheet).forEach(cellRef => {
		if (cellRef[0] === '!') return;
		worksheet[cellRef].s = {
			...worksheet[cellRef].s,
			alignment: {
				wrapText: true,
				vertical: 'top',
				horizontal: 'left'
			}
		};
	});

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

export function getHazardExportFileName (hazard: string) {
	const now = new Date()
	return `lhd_${hazard}_${now.getFullYear()}${now.getMonth()}${now.getDate()}_${now.getHours()}${now.getMinutes()}${now.getSeconds()}.xlsx`;
}

function checkType(value: any) {
	if(Array.isArray(value)) {
		return value.join(', ')
	} else {
		return value
	}
}
