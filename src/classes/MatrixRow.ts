/**
 * This file is part of matrix-ts.
 * (c) 2021 Prokop Schield
 *
 * matrix-ts is free software, licensed under
 * the GNU Lesser General Public License,
 * version 3.0, or any later version.
 */

export default class MatrixRow extends Array<number> {
	init(vals: (number | bigint | string)[] = this) {
		for (let i = 0; i < vals.length; ++i) {
			this[i] = Number(vals[i]) || 0;
		}
	}
	constructor(...args: (number | bigint | string)[]) {
		super(args.length);
		this.init(args);
	}
	get cols() {
		return this.length;
	}
	set cols(n) {
		this.length = n;
		this.init();
	}
}
