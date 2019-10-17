import { Rects, Primary, Side, Direction, AnchorEnum } from "../types";

import { splitAnchor, getPrimaryDirection } from "../anchor";

type PositionGetterArguments = {
  rects: Rects;
  scrollTop: number;
  scrollLeft: number;
  triggerOffset: number;
  offsetSecondary: number;
  primaryDirection: Direction;
};

type PositionGetter = (args: PositionGetterArguments) => React.CSSProperties;

const primaryStyleGetters: Record<Primary, PositionGetter> = {
  BOTTOM: ({ rects, scrollTop, triggerOffset }) => {
    const { trigger, relativeParent } = rects;
    return {
      top:
        trigger.top +
        trigger.height -
        (relativeParent.top - scrollTop) +
        triggerOffset
    };
  },
  TOP: ({ rects, scrollTop, triggerOffset }) => {
    const { trigger, relativeParent, layer } = rects;
    return {
      top:
        trigger.top -
        layer.height -
        (relativeParent.top - scrollTop) -
        triggerOffset
    };
  },
  LEFT: ({ rects, scrollLeft, triggerOffset }) => {
    const { trigger, relativeParent, layer } = rects;

    return {
      left:
        trigger.left -
        layer.width -
        (relativeParent.left - scrollLeft) -
        triggerOffset
    };
  },
  RIGHT: ({ rects, scrollLeft, triggerOffset }) => {
    const { trigger, relativeParent } = rects;
    return {
      left:
        trigger.left -
        relativeParent.left +
        scrollLeft +
        trigger.width +
        triggerOffset
    };
  }
};

const secondaryStyleGetters: Record<Side, PositionGetter> = {
  TOP: ({ rects, scrollTop, offsetSecondary }) => {
    const { trigger, relativeParent } = rects;
    return {
      top: trigger.top - relativeParent.top + scrollTop + offsetSecondary
    };
  },
  BOTTOM: ({ rects, scrollTop, offsetSecondary }) => {
    const { trigger, relativeParent, layer } = rects;

    return {
      top:
        trigger.bottom -
        layer.height -
        (relativeParent.top - scrollTop) -
        offsetSecondary
    };
  },
  CENTER: ({
    rects,
    scrollTop,
    scrollLeft,
    primaryDirection,
    offsetSecondary
  }) => {
    const { trigger, relativeParent, layer } = rects;

    if (primaryDirection === "Y") {
      return {
        left:
          trigger.left -
          relativeParent.left +
          scrollLeft +
          trigger.width / 2 -
          layer.width / 2 -
          offsetSecondary
      };
    }

    return {
      top:
        trigger.top -
        relativeParent.top +
        scrollTop +
        trigger.height / 2 -
        layer.height / 2 +
        offsetSecondary
    };
  },
  LEFT: ({ rects, scrollLeft, offsetSecondary }) => {
    const { trigger, relativeParent } = rects;
    return {
      left: trigger.left - relativeParent.left + scrollLeft + offsetSecondary
    };
  },
  RIGHT: ({ rects, scrollLeft, offsetSecondary }) => {
    const { trigger, relativeParent, layer } = rects;

    return {
      left:
        trigger.right -
        layer.width -
        (relativeParent.left - scrollLeft) -
        offsetSecondary
    };
  }
};

const centerGetter: PositionGetter = ({ rects, scrollTop, scrollLeft }) => {
  const { trigger, relativeParent, layer } = rects;

  const left =
    trigger.left -
    relativeParent.left +
    scrollLeft +
    trigger.width / 2 -
    layer.width / 2;

  const top =
    trigger.top -
    relativeParent.top +
    scrollTop +
    trigger.height / 2 -
    layer.height / 2;

  return {
    top,
    left
  };
};

type GetAbsolutePositionsArgs = {
  anchor: AnchorEnum;
  rects: Rects;
  scrollTop: number;
  scrollLeft: number;
  triggerOffset: number;
  offsetSecondary: number;
};

export default function getAbsolutePositions({
  anchor,
  rects,
  triggerOffset,
  offsetSecondary,
  scrollLeft,
  scrollTop
}: GetAbsolutePositionsArgs) {
  if (anchor === "CENTER") {
    return centerGetter({
      rects,
      triggerOffset,
      offsetSecondary,
      scrollLeft,
      scrollTop,
      primaryDirection: "Y"
    });
  }

  const { primary, secondary } = splitAnchor(anchor);

  const primaryDirection = getPrimaryDirection(anchor);

  const primaryStyle = primaryStyleGetters[primary]({
    rects,
    triggerOffset,
    offsetSecondary,
    scrollLeft,
    scrollTop,
    primaryDirection
  });
  const secondaryStyle = secondaryStyleGetters[secondary]({
    rects,
    triggerOffset,
    offsetSecondary,
    scrollLeft,
    scrollTop,
    primaryDirection
  });

  return {
    ...primaryStyle,
    ...secondaryStyle
  };
}
