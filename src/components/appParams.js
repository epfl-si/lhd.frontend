import { Button } from '@epfl/epfl-sti-react-library';
import { Form } from 'react-bootstrap';

export default function AppParams(pList) {
	console.log(pList.pList);
	return (
		<div
			style={{
				display: 'flex',
				flexDirection: 'row',
				justifyContent: 'space-between',
				alignItems: 'center',
			}}
		>
			<Form
				style={{
					textAlign: 'left',
					gap: 2,
				}}
			>
				<Form.Group controlId="loc">
					{Object.entries(pList.pList).map(e => (
						<Form.Select aria-label="Default select">
							<option>{e[0]}</option>
							{e[1].map((e, i) => (
								<option value={i}>{e}</option>
							))}
						</Form.Select>
					))}

					{/* <Form.Select aria-label="Default select example">
						<option>Room</option>
						{pList.pList.ro.map(e => (
							<option value="1">{e}</option>
						))}
					</Form.Select>
					<Form.Select aria-label="Default select example">
						<option>Designation</option>
						{pList.pList.de.map(e => (
							<option value="1">{e}</option>
						))}
					</Form.Select>
				</Form.Group>
				<Form.Group className="mb-3" controlId="pers">
					<Form.Select aria-label="Default select example">
						<option>Cosec</option>
						{pList.pList.co.map(e => (
							<option value="1">{e}</option>
						))}
					</Form.Select>
					<Form.Select aria-label="Default select example">
						<option>Responsible</option>
						{pList.pList.re.map(e => (
							<option value="1">{e}</option>
						))}
					</Form.Select>
				</Form.Group>
				<Form.Group className="mb-3" controlId="formGroupEmail">
					<Form.Select aria-label="Default select example">
						<option>Faculty</option>
						{pList.pList.fa.map(e => (
							<option value="1">{e}</option>
						))}
					</Form.Select>
					<Form.Select aria-label="Default select example">
						<option>Institute</option>
						{pList.pList.in.map(e => (
							<option value="1">{e}</option>
						))}
					</Form.Select>
					<Form.Select aria-label="Default select example">
						<option>Unit</option>
						{pList.pList.un.map(e => (
							<option value="1">{e}</option>
						))}
					</Form.Select> */}
				</Form.Group>
			</Form>
			<Button label="Reset" />
		</div>
	);
}
