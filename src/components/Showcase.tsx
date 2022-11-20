import styled from "@emotion/styled";
import {
  ComponentProps,
  FC,
  MouseEventHandler,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";

const ratio = [150, 110];
const bump = 5;
const shadowAmplitude = 0.15;

const transition = "0.2s ease-out";

export const ShowcaseImg = styled.img<ShowcaseImageProps>`
  width: ${({ size }) => ((size || 100) / 100) * ratio[1]}px;
  height: ${({ size }) => ((size || 100) / 100) * ratio[0]}px;
  object-fit: cover;
  object-position: center center;
`;

export const Wrapper = styled.div<Partial<ShowcaseWrapperProps>>`
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  justify-content: center;
`;

export const Overlay = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  transition: background ${transition};
`;

export interface MousePosition {
  x: number;
  y: number;
}
export interface SizeType {
  width: number;
  height: number;
}

export interface ShowcaseImageProps {
  size?: number;
}
export interface ShowcaseWrapperProps extends SizeType {
  focus: MousePosition | undefined;
}

export interface ShowcaseControllerProps {
  debug?: boolean;
  shadow?: boolean;
  reflection?: boolean;
  radialReflection?: boolean;
}

export interface ShowcaseProps
  extends ShowcaseImageProps,
    ShowcaseControllerProps {}

export interface ShowcaseOwnProps
  extends ComponentProps<typeof ShowcaseImg>,
    ShowcaseProps {}

export const Showcase: FC<ShowcaseOwnProps> = ({
  debug,
  shadow,
  reflection,
  radialReflection,
  ...props
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<SizeType>();
  useEffect(() => {
    if (!ref.current) {
      return undefined;
    }
    const { current: element } = ref;
    const handler = () => {
      const { width, height } = element.getBoundingClientRect();
      setSize({ width, height });
    };
    const resizeObserver = new ResizeObserver(handler);
    resizeObserver.observe(element);
    return () => resizeObserver.unobserve(element);
  }, [setSize, ref]);
  const [position, setPosition] = useState<MousePosition>();
  const onEnterMove = useCallback<MouseEventHandler<HTMLDivElement>>(
    ({ clientX, clientY, target: element }) => {
      const {
        top,
        left,
        width,
        height
      } = (element as HTMLDivElement).getBoundingClientRect();
      const [x, y] = [clientX - left, clientY - top];
      setPosition({ x: x / width, y: y / height });
    },
    [setPosition]
  );
  const onLeave = useCallback(() => {
    setPosition(undefined);
  }, [setPosition]);
  const transform = useMemo(() => {
    if (!position) {
      return "none";
    }
    const { x, y } = position;
    return [
      "perspective(150px)",
      `rotateY(${(x - 0.5) * bump}deg)`,
      `rotateX(${(y - 0.5) * bump * -1}deg)`,
      "translate3d(0, 0, 0)"
    ].join(" ");
  }, [position]);
  const boxShadow = useMemo(() => {
    if (!(size && position)) {
      return "";
    }
    const { x, y } = position;
    const { width, height } = size;
    const xOffset = (x - 0.5) * width * -1 * shadowAmplitude;
    const yOffset = (y - 0.5) * height * -1 * shadowAmplitude;
    const slope = [x, y]
      .map((it) => Math.abs(it - 0.5))
      .reduce((acc, it) => Math.max(acc, it), 0);
    const blur = Math.max(slope, 0.4) * 50;
    const spread = Math.max(0.1, slope) * 20;
    const color = `rgba(0, 0, 0, ${Math.max(0, Math.min(1 - slope) - 0.3)})`;
    const shadow = [
      ...[xOffset, yOffset, blur, spread].map((it) => `${it.toPrecision(2)}px`),
      color
    ].join(" ");
    return shadow;
  }, [size, position]);
  const angle = useMemo(() => {
    if (!position) {
      return undefined;
    }
    const { x, y } = position;
    const a = (Math.atan2(y - 0.5, x - 0.5) * 180) / Math.PI + 90;
    if (a < 0) {
      return a + 360;
    }
    return a;
  }, [position]);
  const background = useMemo(() => {
    if (!(angle && position)) {
      return "";
    }
    const { x, y } = position;
    const offset =
      25 +
      ([x, y]
        .map((it) => Math.abs(it - 0.5))
        .reduce((acc, it) => Math.max(it, acc), 0) /
        0.5) *
        5;
    return `linear-gradient(${angle}deg, transparent, #fff2 ${offset}%, transparent ${offset}%, transparent)`;
  }, [angle, position]);
  const radialBackground = useMemo(() => {
    if (!position) {
      return "";
    }
    const { x, y } = position;
    const amplitude = Math.max(
      0.6,
      1 -
      [x, y]
        .map((it) => Math.abs(it - 0.5))
        .reduce((acc, it) => Math.max(it, acc), 0) / 0.5
    );
    
    const gradientAmplitude = amplitude * 100;
    const gradient = [
      "radial-gradient",
      "(",
      [
        [
          "circle farthest-corner at",
          [x, y].map((it) => `${it * 100}%`).join(" ")
        ].join(" "),
        "transparent",
        `#fff3 ${gradientAmplitude}%`
      ].join(", "),
      ")"
    ].join("");
    return gradient;
  }, [position]);
  return (
    <Wrapper
      ref={ref}
      onMouseEnter={onEnterMove}
      onMouseMove={onEnterMove}
      onMouseLeave={onLeave}
      style={{
        transition: `transform ${transition}`,
        transform: position ? ["scale(1.2)"].join(" ") : "none",
        position: position ? "relative" : undefined
      }}
    >
      <Wrapper
        style={{
          transform,
          boxShadow: shadow ? boxShadow : undefined
        }}
      >
        <ShowcaseImg {...props} />
        {debug ? (
          <>
            <span>
              {position
                ? `${position.x.toPrecision(2)} x ${position.y.toPrecision(2)}`
                : "none"}
            </span>
            <span>{angle ? `${angle.toPrecision(4)}` : "none"}</span>
            {/* <span>{background ? background : "none"}</span> */}
          </>
        ) : null}
        {reflection ? (
          <Overlay
            style={{
              background: radialReflection ? radialBackground : background
            }}
          />
        ) : null}
      </Wrapper>
    </Wrapper>
  );
};
