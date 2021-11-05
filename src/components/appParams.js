import { Button } from '@epfl/epfl-sti-react-library';
import { useEffect } from 'react';
import { Form } from 'react-bootstrap';

export default function AppParams(pList) {
	const params = {
		bu: pList.pList.bu.map(e => <option value="1">{e}</option>),
		ro: pList.pList.ro.map(e => <option value="1">{e}</option>),
		de: pList.pList.de.map(e => <option value="1">{e}</option>),
		co: pList.pList.co.map(e => <option value="1">{e}</option>),
		re: pList.pList.re.map(e => <option value="1">{e}</option>),
		fa: pList.pList.fa.map(e => <option value="1">{e}</option>),
		in: pList.pList.in.map(e => <option value="1">{e}</option>),
		un: pList.pList.un.map(e => <option value="1">{e}</option>),
	};
	return (
		<div
			style={{
				display: 'flex',
				flexDirection: 'row',
				justifyContent: 'space-between',
				alignItems: 'center',
			}}
		>
			<Form style={{ textAlign: 'left' }}>
				<Form.Group className="mb-3" controlId="loc">
					<Form.Select aria-label="Default select example">
						<option>Building</option>
						{params.bu}
					</Form.Select>
					<Form.Select aria-label="Default select example">
						<option>Room</option>
						{params.ro}
					</Form.Select>
					<Form.Select aria-label="Default select example">
						<option>Designation</option>
						{params.de}
					</Form.Select>
				</Form.Group>
				<Form.Group className="mb-3" controlId="pers">
					<Form.Select aria-label="Default select example">
						<option>Cosec</option>
						{params.co}
					</Form.Select>
					<Form.Select aria-label="Default select example">
						<option>Responsible</option>
						{params.re}
					</Form.Select>
				</Form.Group>
				<Form.Group className="mb-3" controlId="formGroupEmail">
					<Form.Select aria-label="Default select example">
						<option>Faculty</option>
						{params.fa}
					</Form.Select>
					<Form.Select aria-label="Default select example">
						<option>Institute</option>
						{params.in}
					</Form.Select>
					<Form.Select aria-label="Default select example">
						<option>Unit</option>
						{params.un}
					</Form.Select>
				</Form.Group>
			</Form>
			<Button label="Reset" />
		</div>
	);
}
