import React, { useRef, useState, useEffect } from "react"
import { connect } from "react-redux"
import { setCurrentDj } from "../store/djsSlice"
import { Swiper, SwiperSlide } from "swiper/react"
import Container from "react-bootstrap/Container"
import Col from "react-bootstrap/Col"
import Row from "react-bootstrap/Row"
import Image from "react-bootstrap/Image"
import Button from "react-bootstrap/Button"

import "swiper/css"
import "swiper/css/effect-fade"
import "swiper/css/navigation"
import "swiper/css/pagination"

import "./djsStyle.css"

import { EffectFade, Navigation, Pagination } from "swiper/modules"

let djAudioGreeting = new Audio()

export function DiscJockeys(props) {
  useEffect(() => {
    return () => {
      djAudioGreeting.pause()
    }
  }, [])

  function handleDjAudioGreeting(dj) {
    console.log("dj", dj)
    djAudioGreeting.src =
      dj.details?.audio ||
      "audio/ElevenLabs_2023-09-01T23_59_37_Donny - very deep_gen_s50_sb75_se0_b_m2.mp3"
    djAudioGreeting.play()
  }
  return (
    <>
      <div className="text-light">
        <h1 className="h3 my-3">Select Disc Jockey</h1>
      </div>
      <Swiper
        spaceBetween={30}
        autoHeight={true}
        effect={"fade"}
        grabCursor={true}
        centeredSlides={true}
        navigation={true}
        loop={true}
        modules={[EffectFade, Navigation]}
        className="mySwiper"
        onSlideChange={() => {
          djAudioGreeting.pause()
        }}
      >
        {props.djs.map((dj, idx) => (
          <SwiperSlide key={`dj-${idx}`} className="bg-dark text-light">
            <Row className="g-5 bg-dark text-light">
              <Col sm={12} md={6} className="p-5">
                <Image src={dj.details?.image} />
              </Col>
              <Col sm={12} md={6} className="p-5 text-start bg-dark">
                <h2 className="h3 ">
                  {dj.djName}
                  <Button
                    className="ms-3"
                    size="sm"
                    onClick={() => handleDjAudioGreeting(dj)}
                  >
                    Greeting
                  </Button>
                  <Button
                    className="mx-3"
                    size="sm"
                    onClick={() => props.setCurrentDj(dj)}
                  >
                    Select
                  </Button>
                </h2>
                <p>{dj.details?.context}</p>
              </Col>
            </Row>
          </SwiperSlide>
        ))}
      </Swiper>
    </>
  )
}

const mapStateToProps = (state) => {
  return {
    djs: state.djs.allDjs,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    setCurrentDj: (dj) => dispatch(setCurrentDj(dj)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(DiscJockeys)
