import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import Nav from 'react-bootstrap/Nav';

import './HomePage.css'

const HomePage = () => {
    return (

        <Container>
            <Row className='mt-2 p-2 rounded h2 text-white justify-content-center siteName '>
                Хоби Кошер
            </Row>
            <Row>
                <Nav variant="tabs" defaultActiveKey="/home">
                    <Nav.Item>
                        <Nav.Link>Вход</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="link-1">Регистрация</Nav.Link>
                    </Nav.Item>

                </Nav>
            </Row>
        </Container >

    )
}

export default HomePage
