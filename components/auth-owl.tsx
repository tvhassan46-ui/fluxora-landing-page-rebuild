'use client'

import { useEffect, useRef, type RefObject } from 'react'

const OWL = [
  '..11......................11..',
  '..1211..................1121..',
  '...122111111111111111111221...',
  '...122222222222222222222221...',
  '...122221222222222222122221...',
  '....1222211222222221122221....',
  '...132255551123321155552231...',
  '...132555555512215555555231...',
  '...125555555552255555555521...',
  '...125555555552255555555521...',
  '...125555555552255555555521...',
  '...125555555551155555555521...',
  '...125555555551255555555521...',
  '...132555555551155555555231...',
  '...122255555521325555552221...',
  '....1222222223333222222221....',
  '.....12333334444443333321.....',
  '.....12333334343434333321.....',
  '....1223333444344434333221....',
  '....1223344444444444433221....',
  '....1223344343434343433221....',
  '....1223344434443444333221....',
  '....1223444444444444443221....',
  '....1223434343434343433221....',
  '....1223343444344434433221....',
  '.....12334444444444443321.....',
  '......133443434343434331......',
  '......113344344434443311......',
  '........13344444444331........',
  '.........111111111111.........',
  '..........444....444..........',
  '..........1.1....1.1..........',
]

const WING = [
  '....111...',
  '...12221..',
  '..1222221.',
  '.12323231.',
  '.12222221.',
  '.122222221',
  '.132323231',
  '122222221.',
  '122222221.',
  '.12323231.',
  '.1222221..',
  '.1222221..',
  '.132321...',
  '..1221....',
  '..1211....',
  '...1......',
]

const INK: Record<string, [number, number, number]> = {
  '1': [21, 20, 26],
  '2': [54, 52, 60],
  '3': [84, 81, 92],
  '4': [122, 118, 128],
  '5': [179, 172, 164],
}
const IRIS: [number, number, number] = [240, 163, 58]
const IRIS_LOW: [number, number, number] = [194, 122, 34]
const PUPIL: [number, number, number] = [12, 11, 14]
const GLINT: [number, number, number] = [255, 243, 221]

type AuthOwlProps = {
  emailRef: RefObject<HTMLInputElement | null>
  passwordFocused: boolean
  showPassword: boolean
}

export function AuthOwl({ emailRef, passwordFocused, showPassword }: AuthOwlProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const interactionRef = useRef({ passwordFocused, showPassword })
  interactionRef.current = { passwordFocused, showPassword }

  useEffect(() => {
    const canvas = canvasRef.current
    const email = emailRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context || !email) return

    const width = 44
    const height = 38
    const image = context.createImageData(width, height)
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const part = (x: number, stiffness = 0.12, damping = 0.74) => ({ x, v: 0, to: x, stiffness, damping })
    const leftWing = part(0)
    const rightWing = part(0)
    const lookX = part(0, 0.3, 0.6)
    const lookY = part(0.6, 0.3, 0.6)
    const wingsTo = (value: number) => {
      leftWing.to = value
      rightWing.to = value
    }

    const lookAt = (x: number, y: number) => {
      const bounds = canvas.getBoundingClientRect()
      lookX.to = Math.max(-1, Math.min(1, (x - (bounds.left + bounds.width / 2)) / 150))
      lookY.to = Math.max(-1, Math.min(1, (y - (bounds.top + bounds.height * 0.4)) / 150))
    }

    const lookAtCaret = () => {
      const bounds = email.getBoundingClientRect()
      const style = getComputedStyle(email)
      const measure = document.createElement('canvas').getContext('2d')
      if (!measure) return
      measure.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`
      const caret = measure.measureText(email.value).width - email.scrollLeft
      lookAt(Math.min(bounds.right - 14, bounds.left + parseFloat(style.paddingLeft) + caret), bounds.top + bounds.height / 2)
    }

    const dot = (x: number, y: number, color: [number, number, number]) => {
      x = Math.floor(x) + 7
      y = Math.floor(y) + 4
      if (x < 0 || y < 0 || x >= width || y >= height) return
      const offset = (y * width + x) * 4
      image.data.set(color, offset)
      image.data[offset + 3] = 255
    }

    const eye = (x: number, y: number, blink: number) => {
      const pupilX = Math.floor(x - 1 + lookX.x * 1.5)
      const pupilY = Math.floor(y - 1 + lookY.x * 1.5)
      const lid = y - 3.3 + blink * 6.6
      for (let row = Math.floor(y) - 4; row <= Math.floor(y) + 4; row++) {
        for (let column = Math.floor(x) - 4; column <= Math.floor(x) + 4; column++) {
          if (Math.hypot(column + 0.5 - x, row + 0.5 - y) > 3.3) continue
          let color = row + 0.5 < y + 1.6 ? IRIS : IRIS_LOW
          if (column >= pupilX && column < pupilX + 2 && row >= pupilY && row < pupilY + 2) {
            color = column === pupilX && row === pupilY ? GLINT : PUPIL
          }
          if (row + 0.5 < lid) color = INK[3]
          else if (row + 0.5 < lid + 1 && lid > y - 3.2) color = INK[1]
          dot(column, row, color)
        }
      }
    }

    const wing = (degrees: number, side: number) => {
      const angle = degrees * Math.PI / 180
      const cosine = Math.cos(angle)
      const sine = Math.sin(angle)
      const shoulderX = side > 0 ? 6.8 : 30 - 6.8
      for (let y = -4; y < height - 4; y++) {
        for (let x = -7; x < width - 7; x++) {
          const dx = (x + 0.5 - shoulderX) * side
          const dy = y + 0.5 - 15.5
          const u = Math.floor(dx * cosine + dy * sine + 5)
          const v = Math.floor(-dx * sine + dy * cosine + 0.5)
          const feather = WING[v]?.[u]
          if (feather && feather !== '.') dot(x, y, INK[feather])
        }
      }
    }

    let blinkAt = -1000
    let nextBlink = 1800
    let frame = 0
    let lastTime: number | undefined
    let accumulator = 0

    const spring = (item: typeof leftWing) => {
      if (reduceMotion.matches) {
        item.x = item.to
        item.v = 0
        return
      }
      item.v = (item.v + (item.to - item.x) * item.stiffness) * item.damping
      item.x += item.v
    }

    const draw = (now: number) => {
      image.data.fill(0)
      OWL.forEach((row, y) => {
        for (let x = 0; x < row.length; x++) {
          if (row[x] !== '.') dot(x, y, INK[row[x]])
        }
      })

      const blinkProgress = (now - blinkAt) / 80
      const blink = blinkProgress < 1 ? blinkProgress : blinkProgress < 2 ? 2 - blinkProgress : 0
      eye(9.6, 10.6, blink)
      eye(20.4, 10.6, blink)
      wing(leftWing.x, 1)
      wing(rightWing.x, -1)
      context.putImageData(image, 0, 0)
    }

    const tick = (now: number) => {
      if (lastTime === undefined) lastTime = now
      accumulator += Math.min(100, now - lastTime)
      lastTime = now
      const interaction = interactionRef.current
      wingsTo(interaction.passwordFocused ? interaction.showPassword ? -65 : -159 : 0)
      for (; accumulator >= 1000 / 60; accumulator -= 1000 / 60) {
        spring(leftWing)
        spring(rightWing)
        spring(lookX)
        spring(lookY)
      }
      if (now > nextBlink) {
        blinkAt = now
        nextBlink = now + 2400 + Math.random() * 3600
      }
      draw(now)
      frame = requestAnimationFrame(tick)
    }

    const onEmailInput = () => lookAtCaret()
    const onEmailFocus = () => lookAtCaret()
    const onEmailBlur = () => {
      lookX.to = 0
      lookY.to = 0.6
    }
    const onPointerMove = (event: PointerEvent) => {
      if (document.activeElement !== email && document.activeElement !== document.getElementById('password')) {
        lookAt(event.clientX, event.clientY)
      }
    }

    email.addEventListener('input', onEmailInput)
    email.addEventListener('focus', onEmailFocus)
    email.addEventListener('blur', onEmailBlur)
    canvas.parentElement?.addEventListener('pointermove', onPointerMove)
    frame = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(frame)
      email.removeEventListener('input', onEmailInput)
      email.removeEventListener('focus', onEmailFocus)
      email.removeEventListener('blur', onEmailBlur)
      canvas.parentElement?.removeEventListener('pointermove', onPointerMove)
    }
  }, [emailRef])

  return <canvas ref={canvasRef} className="auth-owl" width={44} height={38} aria-hidden="true" />
}
