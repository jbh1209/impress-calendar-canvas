import React from 'react';
import { Row, Col } from "reactstrap";

import s from './Instagram.module.scss';
import insta1 from "public/images/e-commerce/home/insta1.jpg";
import insta2 from "public/images/e-commerce/home/insta2.jpg";
import insta3 from "public/images/e-commerce/home/insta3.jpg";
import insta4 from "public/images/e-commerce/home/insta4.jpg";
import insta5 from "public/images/e-commerce/home/insta5.jpg";
import insta6 from "public/images/e-commerce/home/insta6.jpg";

const InstagramWidget = () => (
    <section style={{ marginTop: 80, marginBottom: 80 }}>
        <h3 className={"text-center fw-bold mb-4"}>Follow us on Instagram</h3>
        <Row className={"no-gutters"}>
            <Col md={2} sm={4} xs={6}>
                <img src={insta1} className={"w-100"} />
            </Col>
            <Col md={2} sm={4} xs={6}>
                <img src={insta2} className={"w-100"} />
            </Col>
            <Col md={2} sm={4} xs={6}>
                <img src={insta3} className={"w-100"} />
            </Col>
            <Col md={2} sm={4} xs={6}>
                <img src={insta4} className={"w-100"} />
            </Col>
            <Col md={2} sm={4} xs={6}>
                <img src={insta5} className={"w-100"} />
            </Col>
            <Col md={2} sm={4} xs={6}>
                <img src={insta6} className={"w-100"} />
            </Col>
        </Row>
    </section>    
);

export default InstagramWidget;
