import { Color } from "../Color.js";
import { DeltaE2000Weights } from "../shared/types.js";




// Based on http://www.brucelindbloom.com/index.html?Eqn_DeltaE_CIE2000.html
export function deltaE2000(
	referenceColor: Color, comparedColor: Color,
	[Lw, Cw, Hw]: DeltaE2000Weights = [1, 1, 1]
) {

  const [l1, a1, b1] = referenceColor.getComponents('lab').map(Math.round);
  const [l2, a2, b2] = comparedColor.getComponents('lab').map(Math.round);

	const Lp = (l1 + l2) / 2;
	const C1 = Math.sqrt(a1 ** 2 + b1 ** 2);
	const C2 = Math.sqrt(a2 ** 2 + b2 ** 2);
	const Cd = (C1 + C2) / 2;
	const G = (1 - Math.sqrt(Cd ** 7 / (Cd ** 7 + 25 ** 7))) / 2;
	const a1p = a1 * (1 + G);
	const a2p = a2 * (1 + G);

	const C1p = Math.sqrt(a1p ** 2 + b1 ** 2);
	const C2p = Math.sqrt(a2p ** 2 + b2 ** 2);

	const Cdp = (C1p + C2p) / 2;

	const [h1p, h2p] = [
		[b1, a1p],
		[b2, a2p],
	].map(([x, y]) => {
		if (x === 0 && y === 0) {
			return 0;
		}
		const angle = rtod(Math.atan2(x, y));
		return angle >= 0 ? angle : angle + 360;
	});

	let deltahp = h2p - h1p;
	if (Math.abs(deltahp) > 180) {
		if (h2p <= h1p) {
			deltahp += 360;
		} else {
			deltahp -= 360;
		}
	}

	const deltaHp = 2 * Math.sqrt(C1p * C2p) * Math.sin(dtor(deltahp) / 2);

	const Hdp =
		Math.abs(h1p - h2p) > 180 ? (h1p + h2p + 360) / 2 : (h1p + h2p) / 2;

	const T =
		1 -
		0.17 * Math.cos(dtor(Hdp - 30)) +
		0.24 * Math.cos(dtor(2 * Hdp)) +
		0.32 * Math.cos(dtor(3 * Hdp + 6)) -
		0.2 * Math.cos(dtor(4 * Hdp - 63));

	const deltaLp = l2 - l1;
	const deltaCp = C2p - C1p;

	const Sl = 1 + (0.015 * (Lp - 50) ** 2) / Math.sqrt(20 + (Lp - 50) ** 2);
	const Sc = 1 + 0.045 * Cdp;
	const Sh = 1 + 0.015 * Cdp * T;

	const deltaTheta = 30 * Math.exp(-(((Hdp - 275) / 25) ** 2));

	const Rc = 2 * Math.sqrt(Cdp ** 7 / (Cdp ** 7 + 25 ** 7));
	const Rt = -1 * Rc * Math.sin(dtor(2 * deltaTheta));
	return Math.sqrt(
		(deltaLp / (Lw * Sl)) ** 2 +
			(deltaCp / (Cw * Sc)) ** 2 +
			(deltaHp / (Hw * Sh)) ** 2 +
			Rt * ((deltaCp / Cw) * Sc) * ((deltaHp / Hw) * Sh)
	);
}

function rtod(radians: number) {
	return radians * (180 / Math.PI);
}

function dtor(degrees: number) {
	return degrees * (Math.PI / 180);
}
