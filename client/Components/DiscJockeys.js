import React, { useRef, useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { setCurrentDj } from '../store/djsSlice'
import { Swiper, SwiperSlide } from 'swiper/react'
import { EffectFade, Pagination } from 'swiper/modules'
import { Container, Col, Row, Image, Button } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { FaMicrophone } from 'react-icons/fa'

import 'swiper/css'
import 'swiper/css/effect-fade'
import 'swiper/css/pagination'

import './djsStyle.css'

let djAudioGreeting = new Audio()

export function DiscJockeys(props) {
  useEffect(() => {
    return () => {
      djAudioGreeting.pause()
    }
  }, [])

  const navigate = useNavigate()
  const sliderRef = useRef()

  const [isPlaying, setIsPlaying] = useState(false)

  function handleDjAudioGreeting(dj) {
    if (
      djAudioGreeting.src !==
      (dj.details?.audio ||
        window.location.origin + '/audio/default_audio_path.mp3')
    ) {
      djAudioGreeting.src = dj.details?.audio || '/audio/default_audio_path.mp3'
    }

    djAudioGreeting.onplay = () => setIsPlaying(true)
    djAudioGreeting.onended = () => setIsPlaying(false)
    djAudioGreeting.onpause = () => setIsPlaying('paused')

    if (djAudioGreeting.paused) {
      if (isPlaying === 'paused') {
        djAudioGreeting.play()
      } else {
        djAudioGreeting.currentTime = 0
        djAudioGreeting.play()
      }
    } else {
      djAudioGreeting.pause()
    }
  }

  function handleSelectDj(dj) {
    props.selectDj(dj)
    navigate(props.currentStation ? `/radio/player` : `/radio/stations`)
  }

  // Inside your component
  const [imageHeight, setImageHeight] = useState(null)
  const imageRef = useRef(null)

  function handleResize() {
    if (imageRef.current) {
      setImageHeight(imageRef.current.clientHeight)
    }
  }

  useEffect(() => {
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [imageRef])

  // const sliderRef = useRef()
  const handleMouseScroll2 = (e) => {
    const swiper = sliderRef.current.swiper

    if (e.deltaX > 0) {
      swiper.slideNext()
    } else if (e.deltaX < 0) {
      swiper.slidePrev()
    }
  }

  return (
    <Col>
      <Row className="text-light title">
        <h1 className="h3 mt-3 mb-3">Select Your Disc Jockey</h1>
      </Row>
      <Row>
        <Col
          onWheel={handleMouseScroll2}
          style={{
            overflow: 'hidden',
            objectFit: 'contain',
            justifyContent: 'center',
          }}
        >
          <Row>
            <Swiper
              ref={sliderRef}
              modules={[EffectFade, Pagination]}
              effect="fade"
              autoHeight={true}
              spaceBetween={20}
              slidesPerView={1}
              centeredSlides
              pagination={{
                type: 'bullets',
                clickable: true,
              }}
              loop
              onSlideChange={() => {
                djAudioGreeting.pause()
              }}
            >
              {props.djs.map((dj, idx) => (
                <SwiperSlide
                  key={`dj-${idx}`}
                  className="bg-dark text-light swiper-slide"
                >
                  <Row className="content-row">
                    <Col xs={12} md={6} lg={6} className="image-container">
                      <Image
                        ref={imageRef}
                        src={dj.details?.image}
                        className="rounded-image"
                      />
                    </Col>

                    <Col xs={12} md={6} lg={6} className="text-column">
                      <Row className="text-row-header">
                        <Col className="dj-name-container">
                          <span className="dj-name">{dj.djName}</span>
                        </Col>
                        <Col className="buttons-container">
                          <FaMicrophone
                            className={`microphone-icon ${
                              isPlaying === true
                                ? 'playing'
                                : isPlaying === 'paused'
                                ? 'paused'
                                : ''
                            }`}
                            onClick={() => handleDjAudioGreeting(dj)}
                          />
                          <button
                            onClick={() => handleSelectDj(dj)}
                            className="select-button"
                          >
                            Select
                          </button>
                        </Col>
                      </Row>
                      <Row className="text-container">
                        <p className="text">{dj.details?.context}</p>
                      </Row>
                    </Col>
                  </Row>
                </SwiperSlide>
              ))}
            </Swiper>
          </Row>
        </Col>
      </Row>
    </Col>
  )
}

const mapStateToProps = (state) => {
  return {
    djs: state.djs.allDjs,
    currentStation: state.stations.currentStation,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    setCurrentDj: (dj) => dispatch(setCurrentDj(dj)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(DiscJockeys)
