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
