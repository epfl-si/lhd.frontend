import React, {useState} from "react";
import {handleClickFileLink, readFileAsBase64} from "../../utils/ressources/file";
import {useOpenIDConnectContext} from "@epfl-si/react-appauth";
import {genericType} from "../../utils/ressources/types";
import {Button} from "epfl-elements-react-si-extra";

interface MultiFileUploaderProps {
	selectedFiles: genericType[];
	setSelectedFiles: (files: genericType[]) => void;
	maxFiles?: number;
	selectedId: string;
	model: string;
}

export default function MultiFileUploader({
	selectedFiles,
	setSelectedFiles,
	maxFiles = 1,
	selectedId,
	model
}: MultiFileUploaderProps) {
	const oidc = useOpenIDConnectContext();
	const [visibleFiles, setvisibleFiles] = useState<genericType[]>(selectedFiles);

	const handleFileChange = async (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		if (!event.target.files) return;
		const newFiles = Array.from(event.target.files);
		const fileList: genericType[] = [];
		for (let i = 0; i < newFiles.length; i++) {
			const base64 = await readFileAsBase64(newFiles[i]);
			fileList.push({status: "New", file_path: newFiles[i].name, base64});
		}
		setSelectedFiles([...selectedFiles, ...fileList]);
		setvisibleFiles([...visibleFiles, ...fileList]);

		// Allows selecting the same file again after removal
		event.target.value = "";
	};

	return <div style={{display: "flex", flexDirection: "column"}}>
		<div>
			<input
				id="file"
				style={{fontSize: 'small'}}
				type="file"
				onChange={handleFileChange}
				accept='.pdf'
				multiple
			/>
		</div>
		{visibleFiles.map(file => {
			if (file.file_path) {
				return <div style={{display: "flex", flexDirection: "row", alignItems: "baseline", marginTop: "5px"}}>
					<a style={{fontSize: 'small'}}
						 onClick={async e => await handleClickFileLink(e, oidc.accessToken, selectedId, model, file.file_path)}
						 href={file.file_path}>{file.file_path.split('/').pop()}
					</a>
					<Button size="icon"
									style={{marginLeft: '10px'}}
									iconName={`#trash`}
									onClick={() => {
										const list = selectedFiles.map(f => {
											if ( f.file_path !== file.file_path ) return f;
											if ( f.status === 'New' ) return undefined;
											if ( f.status === undefined ) return {...f, status: 'Deleted'} as genericType;
											return f;
										}).filter(f => f !== undefined);
										setSelectedFiles(list);
										setvisibleFiles(list.filter(f => f?.status !== 'Deleted'))
									}}/>
				</div>
			}
		})}
	</div>
}
