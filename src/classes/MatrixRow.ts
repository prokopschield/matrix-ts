/**
 * This file is part of matrix-ts.
 * (c) 2021 Prokop Schield
 *
 * matrix-ts is free software, licensed under
 * the GNU Lesser General Public License,
 * version 3.0, or any later version.
 */

export default class MatrixRow extends Array<number> {
	constructor(...args: number[]) {
		super(args.length);
		for (let i = 0; i < args.length; ++i) {
			this[i] = args[i] || 0;
		}
	}
	get cols() {
		return this.length;
	}
	set cols(n) {
		if (n < this.length) {
			this.length = n;
		} else {
			while (n > this.length) {
				this.push(0);
			}
		}
	}
}
