import { Button } from '@epfl/epfl-sti-react-library';
import { Form } from 'react-bootstrap';

export default function AppParams() {
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
						<option value="1">AAC</option>
						<option value="2">AI</option>
						<option value="3">AN</option>
					</Form.Select>
					<Form.Select aria-label="Default select example">
						<option>Sector</option>
						<option value="1">1</option>
						<option value="2">2</option>
						<option value="3">3</option>
					</Form.Select>
					<Form.Select aria-label="Default select example">
						<option>Room</option>
						<option value="1">1</option>
						<option value="2">2</option>
						<option value="3">3</option>
					</Form.Select>
					<Form.Select aria-label="Default select example">
						<option>Designation</option>
						<option value="1">None</option>
						<option value="2">Lab</option>
						<option value="3">Storage</option>
					</Form.Select>
				</Form.Group>
				<Form.Group className="mb-3" controlId="pers">
					<Form.Select aria-label="Default select example">
						<option>Cosec</option>
						<option value="1">asdd</option>
						<option value="2">asd</option>
						<option value="3">asddsa</option>
					</Form.Select>
					<Form.Select aria-label="Default select example">
						<option>Responsible</option>
						<option value="1">fdsdsf</option>
						<option value="2">dfsfds</option>
						<option value="3">sdfsd</option>
					</Form.Select>
				</Form.Group>
				<Form.Group className="mb-3" controlId="formGroupEmail">
					<Form.Select aria-label="Default select example">
						<option>Faculty</option>
						<option value="1">fdsdsf</option>
						<option value="2">dfsfds</option>
						<option value="3">sdfsd</option>
					</Form.Select>
					<Form.Select aria-label="Default select example">
						<option>Institute</option>
						<option value="1">fdsdsf</option>
						<option value="2">dfsfds</option>
						<option value="3">sdfsd</option>
					</Form.Select>
					<Form.Select aria-label="Default select example">
						<option>Unit</option>
						<option value="1">fdsdsf</option>
						<option value="2">dfsfds</option>
						<option value="3">sdfsd</option>
					</Form.Select>
				</Form.Group>
			</Form>
			<Button label="Reset" />
		</div>
	);
}
