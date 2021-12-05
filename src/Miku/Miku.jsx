import './Miku.less'
import Part from "./Part";
/*
head (a=1, b=0, c=0, d=1, tx=1.7, ty=-125.05)
upper (a=1, b=0, c=0, d=1, tx=0.05, ty=-70.9)
lower (a=1, b=0, c=0, d=1, tx=0.5, ty=-67.45)
armL (a=1, b=0, c=0, d=1, tx=-17.35, ty=-88.75)
armR (a=1, b=0, c=0, d=1, tx=14.15, ty=-89.75)
 */
const mockConfig={
    id:'root',
    width:800,
    height:600,
    x:400,
    y:400,
    components:[
        {
            id:'upper',
            width:800,
            height:600,
            resourceCenterX:400,
            resourceCenterY:300,
            x:({side_sin})=> side_sin * 5,
            y:({lean})=>-71+ 4 * lean,
            rotation:({side_sin})=>-side_sin * 15,
            resource:"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' version='1.1' xmlns:xlink='http://www.w3.org/1999/xlink' preserveAspectRatio='none' x='0px' y='0px' width='800px' height='600px' viewBox='-400 -300 800 600'%3e %3cdefs%3e %3cg id='Layer0_0_FILL'%3e %3cpath fill='%2371778E' stroke='none' d=' M -8.05 -3.8 L -8.05 -3.7 -7.95 -3.7 Q -8 -3.75 -8.05 -3.8 M -15.55 -14.15 L -15.4 -14.2 Q -15.45 -14.3 -15.55 -14.3 L -15.55 -14.15 M -2.3 -13.45 Q -2.55 -14.8 -2.8 -16.1 L -3.25 -16.1 -2.75 -2.25 -1.45 -2 Q -1 -6.75 -1.95 -11.4 -2.15 -12.45 -2.3 -13.45 Z'/%3e %3cpath fill='%23B3B3CC' stroke='none' d=' M -13.5 -31.25 Q -14.4 -29.25 -15.25 -24.95 -15.6955078125 -22.54453125 -15.95 -21.25 -15.6775390625 -21.27109375 -15.4 -21.3 -12.4865234375 -21.585546875 -4.1 -22 -4.6 -24.47734375 -4.6 -24.8 -4.6 -26.4509765625 -2.95 -32.1 -3.0548828125 -31.7703125 -3.15 -31.45 -6.296875 -31.9408203125 -8.8 -35.25 -9.3546875 -35.97734375 -9.8 -36.6 -12.7931640625 -32.993359375 -13.5 -31.25 M 14.05 -40.5 Q 12.943359375 -38.6220703125 9.35 -35.85 3.4751953125 -31.4068359375 -1.9 -31.35 -3.35 -25.414453125 -3.35 -24.75 -3.35 -23.4802734375 -3.05 -22.05 2.927734375 -22.2853515625 11.5 -22.6 15.12265625 -22.147265625 17.65 -21.65 17.8595703125 -24.259765625 17.9 -27.05 18.05 -37.45 15 -40.05 14.54609375 -40.288671875 14.05 -40.5 Z'/%3e %3cpath fill='%23878AA3' stroke='none' d=' M 9.35 -35.85 Q 12.943359375 -38.6220703125 14.05 -40.5 13.7423828125 -40.6580078125 13.4 -40.8 12.4427734375 -41.1951171875 11.4 -41.5 7.8138671875 -42.548046875 3.4 -42.45 -3.614453125 -42.242578125 -7.8 -38.65 -8.5169921875 -38.0376953125 -9.15 -37.35 -9.278125 -37.194140625 -9.4 -37.05 -9.59296875 -36.8224609375 -9.8 -36.6 -9.3546875 -35.97734375 -8.8 -35.25 -6.296875 -31.9408203125 -3.15 -31.45 -3.0548828125 -31.7703125 -2.95 -32.1 -4.6 -26.4509765625 -4.6 -24.8 -4.6 -24.47734375 -4.1 -22 -12.4865234375 -21.585546875 -15.4 -21.3 -15.6775390625 -21.27109375 -15.95 -21.25 -15.9736328125 -21.0873046875 -16 -20.95 -16.033203125 -20.8505859375 -15.85 -18.2 -15.7982421875 -17.49140625 -15.75 -16.6 L -15.55 -14.3 Q -15.45 -14.3 -15.4 -14.2 L -15.55 -14.15 -15.5 -10.1 -10.95 -4.3 -8.05 -3.7 -8.05 -3.8 Q -8 -3.75 -7.95 -3.7 L -2.75 -2.25 -3.25 -16.1 -2.8 -16.1 Q -2.55 -14.8 -2.3 -13.45 -2.15 -12.45 -1.95 -11.4 -1 -6.75 -1.45 -2 3.3 -1.55 7.65 -3.45 8.75 -3.95 9.85 -4.45 10.5 -4.8 11.15 -5.15 15.85 -7.65 16.5 -13.05 16.75 -14.85 17.05 -16.6 17.11171875 -16.8490234375 17.15 -17.1 17.4615234375 -19.302734375 17.65 -21.65 15.12265625 -22.147265625 11.5 -22.6 2.927734375 -22.2853515625 -3.05 -22.05 -3.35 -23.4802734375 -3.35 -24.75 -3.35 -25.414453125 -1.9 -31.35 3.4751953125 -31.4068359375 9.35 -35.85 Z'/%3e %3c/g%3e %3cg id='Layer0_1_FILL'%3e %3cpath fill='%23B3B3CC' stroke='none' d=' M 9.55 -47.25 Q 10.4728515625 -46.57890625 11.1 -46.15 11.0857421875 -46.7482421875 10.9 -47.3 10.3076171875 -47.6373046875 8.55 -48.5 6.9171875 -48.85 4.65 -48.85 0.87421875 -48.85 -4.2 -46.1 -4.33984375 -45.4873046875 -4.5 -44.7 L -4.65 -44 Q -4.4587890625 -44 -4.25 -44 -3.2 -44 -1.25 -44.95 -0.05 -45.5 3.55 -47.25 L 9.55 -47.25 Z'/%3e %3cpath fill='%236C6C93' stroke='none' d=' M 11.1 -46.15 Q 10.4728515625 -46.57890625 9.55 -47.25 L 3.55 -47.25 Q -0.05 -45.5 -1.25 -44.95 -3.2 -44 -4.25 -44 -4.4587890625 -44 -4.65 -44 L -4.9 -42.5 Q -4.85 -40.25 -2.85 -39.9 1.45 -39.05 6.5 -41.35 10.75 -43.35 11 -44.65 11.1494140625 -45.441796875 11.1 -46.15 Z'/%3e %3c/g%3e %3cg id='Layer0_2_FILL'%3e %3cpath fill='%23FFE788' stroke='none' d=' M 10.5 -25.85 L 12 -26 Q 13.55 -27.05 13.55 -28.1 13.55 -28.85 13.25 -28.95 12.8 -28.95 12.5 -29.1 3.3 -30.6 3.3 -27.8 3.3 -27.1 3.4 -26.85 3.75 -26.15 5 -25.85 L 10.5 -25.85 Z'/%3e %3c/g%3e %3c/defs%3e %3cg transform='matrix( 1%2c 0%2c 0%2c 1%2c 0%2c0) '%3e %3cuse xlink:href='%23Layer0_0_FILL'/%3e %3c/g%3e %3cg transform='matrix( 1%2c 0%2c 0%2c 1%2c 0%2c0) '%3e %3cuse xlink:href='%23Layer0_1_FILL'/%3e %3c/g%3e %3cg transform='matrix( 1%2c 0%2c 0%2c 1%2c 0%2c0) '%3e %3cuse xlink:href='%23Layer0_2_FILL'/%3e %3c/g%3e %3c/svg%3e",
            components: [
                {
                    id:'collar',
                    width:800,
                    height:600,
                    resourceCenterX:400,
                    resourceCenterY:300,
                    x:-0.25,
                    y:-106.45+71,
                    rotation:({side_sin})=>side_sin * 15,
                    resource:"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' version='1.1' xmlns:xlink='http://www.w3.org/1999/xlink' preserveAspectRatio='none' x='0px' y='0px' width='800px' height='600px' viewBox='-400 -300 800 600'%3e %3cdefs%3e %3cg id='Layer0_0_FILL'%3e %3cpath fill='%23449998' stroke='none' d=' M -3.25 1.5 Q -3.5603515625 1.2783203125 -3.9 1.15 -4.797265625 1.587890625 -6.05 2.65 -5.15 2.85 -4.65 3.15 -4.55546875 3.161328125 -4.45 3.15 -3.566796875 2.314453125 -3.25 1.5 M 8.85 5.5 Q 6.998046875 2.9849609375 5.75 2.15 5.2845703125 1.8513671875 4.9 1.8 L 4.85 1.8 Q 4.7923828125 1.7935546875 4.7 1.8 4.6498046875 1.7986328125 4.55 1.8 4.5111328125 1.8125 4.45 1.8 4.344921875 2.2119140625 4.3 2.75 L 4.9 2.75 Q 5.65 3.25 6.25 5.7 6.6380859375 7.1111328125 6.7 7.85 8.0162109375 6.552734375 8.85 5.5 Z'/%3e %3cpath fill='%23878AA3' stroke='none' d=' M -1.5 1.75 Q -1.18984375 1.644921875 -1 1.55 -1.2 1.2 -1.7 0.65 -2.2 0.1 -2.5 -0.1 -5.6 -0.65 -8.2 1.55 -9.7 2.8 -12.35 6 -12.7 6.35 -15.75 9 -16.0958984375 9.327734375 -16.4 9.6 -16.2607421875 11.00078125 -15.75 11.75 -14.35 11.05 -9.05 5.45 -8.65 5 -8.2 4.65 -7.05 3.45 -6.05 2.65 -4.797265625 1.587890625 -3.9 1.15 -3.1509765625 0.781640625 -2.65 0.85 -2.54921875 0.88359375 -1.5 1.75 M -1.75 -6.4 Q -2.7408203125 -8.64609375 -3.45 -9.5 -3.925390625 -9.0353515625 -4.3 -8.4 -5 -7.3 -5 -6.35 -5 -4.9 -4.15 -4.6 -2.55 -4.05 -1.5 -2.85 L -0.75 -3.1 Q -0.65 -3.2 -0.5 -3.4 L -0.5 -3.45 Q -1.223046875 -5.18125 -1.75 -6.4 M 14.6 8.8 Q 14.3349609375 8.4466796875 14.05 8.1 11.8 5.7 10.75 4.3 8.75 1.2 5.45 0.2 2.05 -0.8 2.05 2 2.05 2.8123046875 2.15 2.8 L 2.15 2.75 Q 2.2359375 2.7296875 2.3 2.55 2.28515625 2.623828125 2.35 2.65 2.5486328125 2.589453125 2.75 2.5 3.9 1.865625 4.55 1.8 4.6498046875 1.7986328125 4.7 1.8 4.7923828125 1.7935546875 4.85 1.8 L 4.9 1.8 Q 5.2845703125 1.8513671875 5.75 2.15 6.998046875 2.9849609375 8.85 5.5 9.1578125 5.8671875 9.45 6.25 9.473828125 6.3130859375 9.5 6.35 10.933203125 8.186328125 12.25 10.1 12.436328125 10.3162109375 12.65 10.55 12.96640625 10.5599609375 13.3 10.35 L 14.45 9 Q 14.53359375 8.9126953125 14.6 8.8 M 10.05 -11.25 Q 10.05 -11.4083984375 10.05 -11.55 L 10 -11.55 Q 9.85 -11.3 9.75 -11.3 9.7 -11.25 9.65 -10.9 7.65 -9.95 5.9 -7.7 2.4240234375 -3.302734375 0.85 -1.95 1.1162109375 -1.85 1.75 -1.85 2.4 -1.85 3.65 -2.9 5.3 -4.3 8 -5.25 9.05 -5.9 10.05 -11.25 Z'/%3e %3cpath fill='%23A3A4BA' stroke='none' d=' M 2.15 2.75 L 2.15 2.8 Q 2.257421875 2.739453125 2.35 2.65 2.28515625 2.623828125 2.3 2.55 2.2359375 2.7296875 2.15 2.75 M 12.25 10.1 Q 12.398828125 10.32578125 12.55 10.55 12.9138671875 10.603515625 13.3 10.35 12.96640625 10.5599609375 12.65 10.55 12.436328125 10.3162109375 12.25 10.1 Z'/%3e %3cpath fill='%23B3B3CC' stroke='none' d=' M 10.05 -11.55 Q 10.05 -11.4083984375 10.05 -11.25 9.05 -5.9 8 -5.25 5.3 -4.3 3.65 -2.9 2.4 -1.85 1.75 -1.85 1.1162109375 -1.85 0.85 -1.95 0.57734375 -1.654296875 0.35 -1.5 -0.0935546875 -2.5408203125 -0.5 -3.45 L -0.5 -3.4 Q -0.65 -3.2 -0.75 -3.1 L -1.5 -2.85 Q -2.55 -4.05 -4.15 -4.6 -5 -4.9 -5 -6.35 -5 -7.3 -4.3 -8.4 -3.925390625 -9.0353515625 -3.45 -9.5 -3.778515625 -9.8990234375 -4.05 -9.95 -5.1 -10.1 -8.35 -7.35 -12 -4.25 -12.65 -3.95 -14.1 -3.35 -14.95 -0.35 -15.45 1.25 -15.95 4.25 -16.4 7.2 -16.45 8.2 -16.466015625 8.9814453125 -16.4 9.6 -16.0958984375 9.327734375 -15.75 9 -12.7 6.35 -12.35 6 -9.7 2.8 -8.2 1.55 -5.6 -0.65 -2.5 -0.1 -2.2 0.1 -1.7 0.65 -1.2 1.2 -1 1.55 -1.18984375 1.644921875 -1.5 1.75 -0.9541015625 2.176953125 -0.2 2.8 -0.2 2.99375 -0.1 3.1 0.1 3.25 0.75 3.45 0.9 3.4 1.15 3.3 L 1.45 3.25 Q 1.5 3.2 1.55 3.1 1.75 3.05 2 2.9 2.0724609375 2.8515625 2.15 2.8 2.05 2.8123046875 2.05 2 2.05 -0.8 5.45 0.2 8.75 1.2 10.75 4.3 11.8 5.7 14.05 8.1 14.3349609375 8.4466796875 14.6 8.8 15.4904296875 7.2439453125 16.5 4.35 16.85 3.25 18.5 0.25 20.25 -2.6 20.3 -2.85 15.75 -8.95 12.4 -10.75 12.35 -11 12.35 -11.2 12.25 -11.55 12.3 -11.7 11.55 -11.65 10.85 -11.4 10.4275390625 -11.4939453125 10.05 -11.55 Z'/%3e %3c/g%3e %3cg id='Layer0_1_FILL'%3e %3cpath fill='%2353B5B5' stroke='none' d=' M 1.15 3.3 Q 0.9 3.4 0.75 3.45 0.1 3.25 -0.1 3.1 L -0.15 3.05 Q -3.154296875 3.2810546875 -4.45 3.15 -4.55546875 3.161328125 -4.65 3.15 -5.15 2.85 -6.05 2.65 -7.05 3.45 -8.2 4.65 L -8.25 4.8 Q -8.3 5.4 -8 7.35 -7.75 9.35 -7.85 10.4 -8.25 13.75 -6.05 15.25 -4.65 16.25 -1.3 16.75 3.05 17.4 5.1 13.7 6.15 11.85 6.7 8.35 6.7294921875 8.15859375 6.7 7.85 6.6380859375 7.1111328125 6.25 5.7 5.65 3.25 4.9 2.75 L 2 2.9 Q 1.75 3.05 1.55 3.1 1.5 3.2 1.45 3.25 L 1.15 3.3 Z'/%3e %3c/g%3e %3cg id='Layer0_2_FILL'%3e %3cpath fill='%2353B5B5' stroke='none' d=' M -14.5 5.5 L -12.85 5 Q -12.6 5.25 -12.6 4 -12.6 3.85 -13.15 2.95 -13.75 2 -14 1.8 -14.45 2.15 -14.75 3.05 -15.1 3.9 -15.1 4.85 -15.1 5.65 -14.8 5.65 L -14.5 5.5 M 12.55 4.1 Q 13.5 5.15 14 5.3 15.8 3 15.8 2.25 15.8 2.05 15.45 1.4 15.05 0.6 14.5 0 14.2 0.3 12.6 1 11.55 1.45 11.55 2.4 11.55 3 12.55 4.1 Z'/%3e %3c/g%3e %3c/defs%3e %3cg transform='matrix( 1%2c 0%2c 0%2c 1%2c 0%2c0) '%3e %3cuse xlink:href='%23Layer0_0_FILL'/%3e %3c/g%3e %3cg transform='matrix( 1%2c 0%2c 0%2c 1%2c 0%2c0) '%3e %3cuse xlink:href='%23Layer0_1_FILL'/%3e %3c/g%3e %3cg transform='matrix( 1%2c 0%2c 0%2c 1%2c 0%2c0) '%3e %3cuse xlink:href='%23Layer0_2_FILL'/%3e %3c/g%3e %3c/svg%3e"
                },
            ]
        },
        {
            id:'lower',
            width:800,
            height:600,
            resourceCenterX:400,
            resourceCenterY:300,
            x:({side_sin})=>1 + side_sin * 10,
            y:({lean})=>-67+ 4 * lean,
        },
        {
            id:'head',
            width:800,
            height:600,
            resourceCenterX:400,
            resourceCenterY:300,
            x:({side_sin})=>1 + side_sin * 4,
            y:({lean})=>-125+ 10 * (lean),
            rotation:({side_sin})=>side_sin * 30,
            components:[
                {

                    id:'base',
                    width:800,
                    height:600,
                    resourceCenterX:400,
                    resourceCenterY:300,
                    x:1,
                    y:-5.6,
                    resource:"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' version='1.1' xmlns:xlink='http://www.w3.org/1999/xlink' preserveAspectRatio='none' x='0px' y='0px' width='800px' height='600px' viewBox='-400 -300 800 600'%3e %3cdefs%3e %3cg id='Layer0_0_FILL'%3e %3cpath fill='%23FFDBC4' stroke='none' d=' M 46.4 -52.1 Q 47.4 -55.7 47.5 -59.6 48.5958984375 -79.9640625 25.5 -86.3 9.25 -90.7 -7.35 -86.5 -24.8328125 -83.5423828125 -28.2 -82.6 -41.52578125 -75.1478515625 -45.5 -64.7 L -46.6 -62.6 Q -46.65 -62.4 -46.75 -62.15 -46.95 -61.7 -47.15 -61.2 -48.95 -56.55 -49.6 -51.45 -50.7466796875 -42.49375 -49.7 -32.55 -48.66015625 -22.6123046875 -49.15 -16.4 -49.6400390625 -10.1380859375 -49.65 -4.35 -49.603515625 1.443359375 -46.1 4.45 -39 10.45 -29.75 11.75 -26.5 12.25 -23.2 12.85 -15.3 14.05 -7.35 14.1 2.555078125 14.3587890625 14.5 12.35 18.5 11.6732421875 22.2 10.8 34.754296875 7.825 36.15 6.75 38.65 4.2 41 1.5 43.2 -0.95 45.2 -3.5 47.7 -6.65 48.9 -10.4 50.1 -14.25 50.8 -18.1 51.15 -19.95 51.15 -21.85 51.15 -22.15 51.1 -22.4 50.9 -23.6 50.7 -24.75 49.95 -28.5 48 -31.95 46.55 -34.6 45.05 -37.1 44 -38.95 43.75 -40.95 43.45 -43.05 44.2 -44.95 44.85 -46.65 45.35 -48.35 45.9 -50.2 46.4 -52.1 Z'/%3e %3cpath fill='%23448888' stroke='none' d=' M 47.5 -59.6 Q 47.4 -55.7 46.4 -52.1 45.9 -50.2 45.35 -48.35 44.85 -46.65 44.2 -44.95 43.45 -43.05 43.75 -40.95 44 -38.95 45.05 -37.1 46.55 -34.6 48 -31.95 49.95 -28.5 50.7 -24.75 50.9 -23.6 51.1 -22.4 51.15 -22.15 51.15 -21.85 51.15 -19.95 50.8 -18.1 50.1 -14.25 48.9 -10.4 47.7 -6.65 45.2 -3.5 43.2 -0.95 41 1.5 38.65 4.2 36.15 6.75 38.05 5.9 39.9 5 41.7 4.15 43.45 3.25 45.85 2 48.2 0.3 50.35 -1.15 52.3 -2.85 54.8 -5 57.1 -7.35 59 -9.3 60.7 -11.75 62.95 -15 64.2 -18.75 65.2 -21.7 66.15 -24.65 67.15 -27.75 68.1 -30.9 69 -33.95 69.95 -36.95 70.9 -39.85 71.85 -42.95 72.9 -46.5 73.2 -50.3 73.55 -54.15 73.65 -58.05 73.75 -61.4 73.7 -64.7 70.05 -63.35 66.4 -62.15 65.4 -61.8 64.35 -61.6 61.25 -61.1 58.1 -60.65 54 -60.25 50.15 -59.75 48.8 -59.65 47.5 -59.6 Z'/%3e %3cpath fill='%2342B5A8' stroke='none' d=' M 72.1 -75.05 Q 70.3 -79.05 66.8 -85.15 63.6 -90.65 55.05 -96.7 53.7935546875 -97.5947265625 52.55 -98.4 36.9 -107.3 18.7 -109.75 -5.7 -112.65 -25.9 -98.4 -27.630078125 -96.9798828125 -28.95 -95.55 -33.6 -91.25 -35.8 -89 -39.6 -85.05 -40.8 -81.6 -40.8265625 -81.5203125 -41.1 -81 -41.1208984375 -80.958203125 -41.15 -80.95 L -41.1 -80.95 Q -41.801953125 -79.4423828125 -44.25 -74.4 -47.25 -67.95 -47.8 -65.95 -47.946484375 -65.42265625 -47.95 -64.6 L -48.95 -63.3 Q -48.8421875 -63.3720703125 -47.9 -63.8 -47.840234375 -63.4984375 -47.8 -63.2 -47.65 -62 -47.15 -61.2 -46.95 -61.7 -46.75 -62.15 -46.65 -62.4 -46.6 -62.6 L -45.5 -64.7 Q -41.52578125 -75.1478515625 -28.2 -82.6 -24.8328125 -83.5423828125 -7.35 -86.5 9.25 -90.7 25.5 -86.3 48.5958984375 -79.9640625 47.5 -59.6 48.8 -59.65 50.15 -59.75 54 -60.25 58.1 -60.65 61.25 -61.1 64.35 -61.6 65.4 -61.8 66.4 -62.15 70.05 -63.35 73.7 -64.7 73.703125 -65.5416015625 73.7 -66.45 73.75 -71.3 72.1 -75.05 Z'/%3e %3c/g%3e %3cg id='Layer0_1_FILL'%3e %3cpath fill='%2364627B' stroke='none' d=' M -24.05 -98.7 Q -32.2 -96.55 -38 -90.4 L -21.5 -99.25 Q -22.8 -99 -24.05 -98.7 M 54 -85.2 Q 56.8 -79.7 57.9 -77 59 -74.3 58 -73.75 57 -73.25 54.9 -73.25 L 55.35 -72 Q 55.8 -72 55.95 -72.5 56.05 -73.05 60.75 -72.85 60.55 -71.8 62.8 -67.4 65 -63.05 66.85 -50.9 68 -63.25 61.45 -74.5 59.3 -78.2 56.85 -81.55 55.5 -83.45 54 -85.2 Z'/%3e %3cpath fill='%23353443' stroke='none' d=' M -19.35 -99.55 L -21.5 -99.25 -38 -90.4 -41.05 -86.45 -40.25 -85.65 Q -30.9 -94.3 -19.35 -99.55 M 55.95 -72.5 Q 55.8 -72 55.35 -72 59 -61.2 61.55 -50.3 62.4 -46.65 63.1 -42.95 64.15 -44.65 65.05 -46.4 65.8 -47.8 66.4 -49.35 66.65 -50.1 66.85 -50.9 65 -63.05 62.8 -67.4 60.55 -71.8 60.75 -72.85 56.05 -73.05 55.95 -72.5 M 54 -85.2 Q 48.95 -89.95 43 -93.5 41.85 -94.15 40.75 -94.75 51.5 -86.55 54.9 -73.25 57 -73.25 58 -73.75 59 -74.3 57.9 -77 56.8 -79.7 54 -85.2 Z'/%3e %3c/g%3e %3c/defs%3e %3cg transform='matrix( 1%2c 0%2c 0%2c 1%2c 0%2c0) '%3e %3cuse xlink:href='%23Layer0_0_FILL'/%3e %3c/g%3e %3cg transform='matrix( 1%2c 0%2c 0%2c 1%2c 0%2c0) '%3e %3cuse xlink:href='%23Layer0_1_FILL'/%3e %3c/g%3e %3c/svg%3e"
                }
            ]
        },
        {
            id:'armL',
            width:800,
            height:600,
            resourceCenterX:400,
            resourceCenterY:300,
            x:({side_ang})=>-17.35 + (Math.sin(side_ang-.5) + .75) * 5,
            y:({side_cos})=>-88.75 - (0-side_cos) * 10,
            resource:"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' version='1.1' xmlns:xlink='http://www.w3.org/1999/xlink' preserveAspectRatio='none' x='0px' y='0px' width='800px' height='600px' viewBox='-400 -300 800 600'%3e %3cdefs%3e %3cg id='Layer0_0_FILL'%3e %3cpath fill='%233F4152' stroke='none' d=' M 8.6 -14.4 L 8.1 -14.9 -8.2 -15 -8.65 -14.55 Q -8.65 -4.45 -3 4 -2.6 4.6 -1.8 4.85 1.15 6.15 3.25 4.1 5.85 1.6 7.3 -1.8 7.65 -3.75 8.1 -6.15 8.45 -9.2 8.6 -14.4 Z'/%3e %3cpath fill='%2353B5B5' stroke='none' d=' M 7.6 -17.9 L 4.7 -17.65 -0.2 -17.15 -5.15 -17.55 -7.85 -17.55 -8.2 -15 8.1 -14.9 8.6 -14.4 Q 8.6 -15.1 8.6 -15.9 L 7.6 -17.9 Z'/%3e %3cpath fill='%23FFDBC4' stroke='none' d=' M 4.7 -17.65 Q 5.2 -19.8 3.5 -21.15 1.15 -22.95 -2.05 -22.05 -5.4 -20.95 -5.15 -17.55 L -0.2 -17.15 4.7 -17.65 Z'/%3e %3c/g%3e %3cg id='Layer0_1_FILL'%3e %3cpath fill='%23407373' stroke='none' d=' M -3.85 -11.5 Q -3.95 -11.2 -3.95 -10.9 -4.05 -8.6 -4 -6.3 -4 -5.6 -3.9 -4.85 -3.85 -4.45 -3.7 -4 L -2.9 -4.05 Q -2.8 -6.6 -2.9 -9.1 -2.95 -10.55 -3.5 -11.75 L -3.85 -11.5 M -1.5 -12.15 L -1.8 -11.8 -2.1 -4.3 -1.15 -4.35 Q -0.8 -7.85 -1.35 -11.6 -1.4 -11.9 -1.5 -12.15 Z'/%3e %3cpath fill='%23556680' stroke='none' d=' M 0.15 -12.3 Q 0.55 -12.25 0.5 -12.75 -2.25 -13.5 -5.15 -12.95 -5.4 -12.9 -5.6 -12.8 -5.8 -12.2 -5.8 -11.6 -5.85 -10.35 -5.7 -9.1 -5.45 -6.9 -5.55 -4.8 -5.7 -2.65 -4.5 -1.15 L 0.5 -1.75 -0.5 -11.3 Q -1.1 -6.9 -0.25 -2.5 L -4 -2.3 -5 -12.3 Q -2.45 -12.3 0.15 -12.3 Z'/%3e %3c/g%3e %3c/defs%3e %3cg transform='matrix( 1%2c 0%2c 0%2c 1%2c 0%2c0) '%3e %3cuse xlink:href='%23Layer0_0_FILL'/%3e %3c/g%3e %3cg transform='matrix( 1%2c 0%2c 0%2c 1%2c 0%2c0) '%3e %3cuse xlink:href='%23Layer0_1_FILL'/%3e %3c/g%3e %3c/svg%3e"
        },
        {
            id:'armR',
            width:800,
            height:600,
            resourceCenterX:400,
            resourceCenterY:300,
            x:({side_ang})=>14.15 + (Math.sin(side_ang+.5) - .75) * 5,
            y:({side_cos})=>-89.75 - (0-side_cos) * 10,
            resource:"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' version='1.1' xmlns:xlink='http://www.w3.org/1999/xlink' preserveAspectRatio='none' x='0px' y='0px' width='800px' height='600px' viewBox='-400 -300 800 600'%3e %3cdefs%3e %3cg id='Miku_parts_Arm_L_0_Layer0_0_FILL'%3e %3cpath fill='%233F4152' stroke='none' d=' M 8.6 -14.4 L 8.1 -14.9 -8.2 -15 -8.65 -14.55 Q -8.65 -4.45 -3 4 -2.6 4.6 -1.8 4.85 1.15 6.15 3.25 4.1 5.85 1.6 7.3 -1.8 7.65 -3.75 8.1 -6.15 8.45 -9.2 8.6 -14.4 Z'/%3e %3cpath fill='%2353B5B5' stroke='none' d=' M 7.6 -17.9 L 4.7 -17.65 -0.2 -17.15 -5.15 -17.55 -7.85 -17.55 -8.2 -15 8.1 -14.9 8.6 -14.4 Q 8.6 -15.1 8.6 -15.9 L 7.6 -17.9 Z'/%3e %3cpath fill='%23FFDBC4' stroke='none' d=' M 4.7 -17.65 Q 5.2 -19.8 3.5 -21.15 1.15 -22.95 -2.05 -22.05 -5.4 -20.95 -5.15 -17.55 L -0.2 -17.15 4.7 -17.65 Z'/%3e %3c/g%3e %3cg id='Miku_parts_Arm_L_0_Layer0_1_FILL'%3e %3cpath fill='%23407373' stroke='none' d=' M -3.85 -11.5 Q -3.95 -11.2 -3.95 -10.9 -4.05 -8.6 -4 -6.3 -4 -5.6 -3.9 -4.85 -3.85 -4.45 -3.7 -4 L -2.9 -4.05 Q -2.8 -6.6 -2.9 -9.1 -2.95 -10.55 -3.5 -11.75 L -3.85 -11.5 M -1.5 -12.15 L -1.8 -11.8 -2.1 -4.3 -1.15 -4.35 Q -0.8 -7.85 -1.35 -11.6 -1.4 -11.9 -1.5 -12.15 Z'/%3e %3cpath fill='%23556680' stroke='none' d=' M 0.15 -12.3 Q 0.55 -12.25 0.5 -12.75 -2.25 -13.5 -5.15 -12.95 -5.4 -12.9 -5.6 -12.8 -5.8 -12.2 -5.8 -11.6 -5.85 -10.35 -5.7 -9.1 -5.45 -6.9 -5.55 -4.8 -5.7 -2.65 -4.5 -1.15 L 0.5 -1.75 -0.5 -11.3 Q -1.1 -6.9 -0.25 -2.5 L -4 -2.3 -5 -12.3 Q -2.45 -12.3 0.15 -12.3 Z'/%3e %3c/g%3e %3c/defs%3e %3cg transform='matrix( -1%2c 0%2c 0%2c 1%2c -0.1%2c0) '%3e %3cg transform='matrix( 1%2c 0%2c 0%2c 1%2c 0%2c0) '%3e %3cuse xlink:href='%23Miku_parts_Arm_L_0_Layer0_0_FILL'/%3e %3c/g%3e %3cg transform='matrix( 1%2c 0%2c 0%2c 1%2c 0%2c0) '%3e %3cuse xlink:href='%23Miku_parts_Arm_L_0_Layer0_1_FILL'/%3e %3c/g%3e %3c/g%3e %3c/svg%3e"
        },

        /*
        head (a=1, b=0, c=0, d=1, tx=1.7, ty=-125.05)
        upper (a=1, b=0, c=0, d=1, tx=0.05, ty=-70.9)
        lower (a=1, b=0, c=0, d=1, tx=0.5, ty=-67.45)
        armL (a=1, b=0, c=0, d=1, tx=-17.35, ty=-88.75)
        armR (a=1, b=0, c=0, d=1, tx=14.15, ty=-89.75)
         */
    ]
}

export default function Miku(props){
    const {control}=props;
    const parseConfig= (o,root)=> {
        let modified=false;
        let remain=false;
        const _parseConfig = (o, root) => {
            return Object.fromEntries(Object.entries(o).map(([k, v]) => {
                switch (typeof v) {
                    case "object":
                        if (Array.isArray(v)) {
                            return [k, v.map(o => _parseConfig(o))]
                        } else {
                            return [k, _parseConfig(v)]
                        }
                    case "function": {
                        const result = v(control, root);
                        if (result !== undefined) {
                            modified=true;
                            return [k, result];
                        }
                        else {
                            remain=true;
                            return [k, v];
                        }
                    }
                    default:
                        return [k, v]
                }
            }))
        }
        const parsed=_parseConfig(o,root);
        if(remain){
            if(!modified)throw "Infinite Loop In Config File";
            else return parseConfig(parsed,parsed);
        }else return parsed;
    }
    const config=parseConfig(mockConfig,mockConfig);
    return <div className="miku">
        <div className="debug">{JSON.stringify(control)}</div>
        <Part config={config}></Part>
    </div>
}