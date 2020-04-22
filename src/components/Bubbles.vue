<template>
    <div class="bubbleCanvas">
        <div class="bubbles"></div>
        <div class="bubbles"></div>
        <div class="bubbles"></div>
        <div class="bubbles"></div>
        <div class="bubbles"></div>
        <div class="bubbles"></div>
        <div class="bubbles"></div>
        <div class="bubbles"></div>
        <div class="bubbles"></div>
        <div class="bubbles"></div>
        <div class="bubbles"></div>
        <div class="bubbles"></div>
    </div>
</template>

<script>
    export default {
        name: 'Bubbles'
    }
</script>

<style lang="scss" scoped>
    $htmlCols: gold, orange, tomato, lightpink, hotpink, violet, rebeccapurple, deepskyblue, aquamarine, lightgreen, lawngreen, lightseagreen, teal, darkturquoise;

    $canvasH: 16;
    $bubbleDia: 15; 
    .bubbleCanvas {
      pointer-events: none;
      position: absolute;
      top: -6rem;
      width: 100%;
      overflow: hidden;
      height: 40em;

        @media only screen and (max-width: 1300px) {
            top: -12rem;
        }
      
      .bubbles {
        position: absolute;
        top: $canvasH + 3 + rem;
        width: $bubbleDia + px;
        height: $bubbleDia + px;
        margin-left: -$bubbleDia + px;
        background: transparent;
        opacity: 0.8;
        border-radius: 50%;
        @for $i from 1 through 12 {
          &:nth-child(#{$i}) { 
            box-shadow: 
              random(100) + vw (random(10) * -1)+px 0 2 + px #{nth($htmlCols, random(length($htmlCols)))},
              random(100) + vw (random(20) * -1)+px 0 3 + px #{nth($htmlCols, random(length($htmlCols)))},
              random(100) + vw (random(30) * -1)+px 0 1 + px #{nth($htmlCols, random(length($htmlCols)))},
              random(100) + vw (random(5) * -1)+px 0 5 + px #{nth($htmlCols, random(length($htmlCols)))},
              random(100) + vw (random(18) * -1)+px 0 6 + px #{nth($htmlCols, random(length($htmlCols)))},
              random(100) + vw (random(30) * -1)+px 0 3 + px #{nth($htmlCols, random(length($htmlCols)))},
              random(100) + vw (random(12) * -1)+px 0 5 + px #{nth($htmlCols, random(length($htmlCols)))},
              random(100) + vw (random(30) * -1)+px 0 5 + px #{nth($htmlCols, random(length($htmlCols)))},
              random(100) + vw (random(40) * -1)+px 0 2 + px #{nth($htmlCols, random(length($htmlCols)))},
              random(100) + vw (random(10) * -1)+px 0 5 + px #{nth($htmlCols, random(length($htmlCols)))},
              random(100) + vw (random(20) * -1)+px 0 2 + px #{nth($htmlCols, random(length($htmlCols)))},
              random(100) + vw (random(4) * -1)+px 0 5 + px #{nth($htmlCols, random(length($htmlCols)))},
              random(100) + vw (random(20) * -1)+px 0 2 + px #{nth($htmlCols, random(length($htmlCols)))},
              random(100) + vw (random(30) * -1)+px 0 1 + px #{nth($htmlCols, random(length($htmlCols)))},
              random(100) + vw (random(4) * -1)+px 0 6 + px #{nth($htmlCols, random(length($htmlCols)))};
              animation: bubbleUp (random(5) + 5) + s linear random(1000) + ms infinite;
          }
        }//end for
      }//end bubbles
    }

    @keyframes bubbleUp {
        from {
            transform: translateY(0);
        }
        to {
            transform: translateY(-($canvasH + 4) + rem);
        }
    }
</style>