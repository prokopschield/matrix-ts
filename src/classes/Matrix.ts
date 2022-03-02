/**
 * This file is part of matrix-ts.
 * (c) 2021 Prokop Schield
 *
 * matrix-ts is free software, licensed under
 * the GNU Lesser General Public License,
 * version 3.0, or any later version.
 */

import MatrixRow from './MatrixRow';

export default class Matrix extends Array<MatrixRow> {
	/** new Matrix([a, b, c], [d, e, f], [g, h, i]) */
	constructor(...rows: number[][]) {
		super(
			...rows.map(
				(row) => new MatrixRow(...(row instanceof Array ? row : [row]))
			)
		);

		// make sure matrix is complete
		let cols = 0;
		for (let i = 0; i < this.length; ++i) {
			let n = this[i].length;
			if (n > cols) {
				cols = n;
			}
		}
		this.cols = cols;
	}
	/** number of columns of the matrix */
	get cols() {
		return this[0]?.length || 0;
	}
	set cols(n) {
		for (const row of this) {
			row.cols = n;
		}
	}
	/** number of rows of the matrix */
	get rows() {
		return this.length;
	}
	set rows(n) {
		if (n < this.length) {
			this.length = n;
		} else
			while (n > this.length) {
				const row = new MatrixRow();
				row.cols = this.cols;
				this.push(row);
			}
	}
	/** is this matrix a square matrix? */
	get square() {
		return this.rows == this.cols;
	}
	/** cannot be set to false */
	set square(v) {
		if (v) {
			if (this.rows > this.cols) {
				this.cols = this.rows;
			} else if (this.cols > this.rows) {
				this.rows = this.cols;
			}
		}
	}
	/** get the unit matrix of a specified size */
	static unit(num_rows: number = 3) {
		const M = new Matrix();
		M.rows = num_rows;
		M.cols = num_rows;
		for (let i = 0; i < num_rows; ++i) {
			M[i][i] = 1;
		}
		return M;
	}
	/** check if two matrixes are equal */
	equals(M: Matrix): boolean {
		if (this.cols != M.cols || this.rows != M.rows) {
			return false;
		}
		for (let i = 0; i < this.rows; ++i) {
			for (let j = 0; j < this.cols; ++j) {
				if (this[i][j] != M[i][j]) {
					return false;
				}
			}
		}
		return true;
	}
	/** get an identical matrix */
	identity(): Matrix {
		return new Matrix(...this);
	}
	/** get a specific row of this matrix */
	row(n: number): MatrixRow {
		return this[n];
	}
	/** get a specific column of this matrix */
	column(n: number) {
		return this.map((a) => a[n]);
	}
	/** get a specific element of this matrix */
	element(x: number, y: number) {
		return this[x][y];
	}
	/** get a specific range within the matrix */
	range(
		[xm, xM]: [number | undefined, number | undefined],
		[ym, yM]: [number | undefined, number | undefined]
	) {
		return new Matrix(
			...this.map((row) =>
				row.slice(xm || 0, (xM || this.cols) + 1)
			).slice(ym || 0, (yM || this.rows) + 1)
		);
	}
	/** the size of the matrix, as [rows, cols] */
	get size(): [number, number] {
		return [this.rows, this.cols];
	}
	set size([x, y]: [number, number]) {
		this.rows = x;
		this.cols = y;
	}
	/** similar to Array.map() */
	scal_map(op: (n: number) => number): Matrix {
		return new Matrix(...this.map((row) => row.map((a) => op(a))));
	}
	/** add a number to each element of this matrix */
	scal_add(n: number): Matrix {
		return this.scal_map((a) => a + n);
	}
	/** subtract a number from each element of this matrix */
	scal_sub(n: number): Matrix {
		return this.scal_map((a) => a - n);
	}
	/** multiply each element of this matrix by a number */
	scal_mul(n: number): Matrix {
		return this.scal_map((a) => a * n);
	}
	/** divide each element of this matrix by a number */
	scal_div(n: number): Matrix {
		return this.scal_mul(1 / n);
	}
	/** add two matrixes together */
	add(M: Matrix): Matrix {
		const N = new Matrix(...this);
		for (let i = 0; i < M.rows; ++i) {
			for (let j = 0; j < M.cols; ++j) {
				N[i][j] += M[i][j];
			}
		}
		return N;
	}
	/** subtract the argument from this matrix */
	sub(M: Matrix): Matrix {
		const N = new Matrix(...this);
		for (let i = 0; i < M.rows; ++i) {
			for (let j = 0; j < M.cols; ++j) {
				N[i][j] -= M[i][j];
			}
		}
		return N;
	}
	/** calculate this × M */
	mul(M: Matrix): Matrix {
		const N_size = this.rows;
		const k_lim = M.rows;
		const N = Matrix.unit(N_size);
		for (let i = 0; i < N_size; ++i) {
			for (let j = 0; j < N_size; ++j) {
				let n = 0;
				for (let k = 0; k < k_lim; ++k) {
					n += this[i][k] * M[k][j];
				}
				N[i][j] = n;
			}
		}
		return N;
	}
	/** calculate this × inverse(M) */
	div(M: Matrix): Matrix {
		return this.mul(M.inv());
	}
	/** calculate the n-th power of this matrix */
	pow(n: number): Matrix {
		let M = Matrix.unit(this.rows);
		while (n > 0) {
			M = M.mul(this);
			--n;
		}
		if (n < 0) {
			const inv = this.inv();
			while (n < 0) {
				M = M.mul(inv);
				++n;
			}
		}
		return M;
	}
	/**
	 * get a submatrix of this matrix
	 * by removing a row and a column from this matrix
	 * @param i row to remove
	 * @param j column to remove
	 * @returns {Matrix} the submatrix
	 */
	submatrix(i: number, j: number): Matrix {
		return new Matrix(
			...this.map((a) => a.filter((_v, n) => j != n)).filter(
				(_v, n) => i != n
			)
		);
	}
	/** transpose this matrix */
	trans(): Matrix {
		return new Matrix(
			...[...Array(this.cols).keys()].map((n) => this.column(+n))
		);
	}
	/** adjugate this matrix */
	adj(): Matrix {
		const A = this.trans();
		for (let i = 0; i < A.rows; ++i) {
			for (let j = 0; j < A.cols; ++j) {
				A[i][j] = (-1) ** (i + j) * this.submatrix(j, i).det();
			}
		}
		return A;
	}
	/** calculate the determinant of this matrix */
	det(): number {
		if (this.rows <= 1) {
			return this[0][0] || 0;
		}
		if (this.rows <= 2) {
			return (
				(this[0]?.[0] || 0) * (this[1]?.[1] || 0) -
				(this[1]?.[0] || 0) * (this[0]?.[1] || 0)
			);
		}
		return [...Array(this.rows).keys()]
			.map((n) => this[0][n] * this.submatrix(0, n).det() * (-1) ** n)
			.reduce((a, b) => a + b);
	}
	/** calculate the inverse of this matrix */
	inv(): Matrix {
		return this.adj().scal_div(this.det());
	}
	merge_left(M: Matrix) {
		return M.merge_right(this);
	}
	merge_right(M: Matrix) {
		const N = this.identity();
		if (M.rows > N.rows) {
			N.rows = M.rows;
		}
		const offset = this.cols;
		const limit = M.cols;
		for (let row_n = 0; row_n < N.rows; ++row_n) {
			for (let i = 0; i < limit; ++i) {
				N[row_n][i + offset] = M[row_n]?.[i] || 0;
			}
		}
		return N;
	}
	merge_top(M: Matrix) {
		return M.merge_bottom(this);
	}
	merge_bottom(M: Matrix) {
		return new Matrix(...this, ...M);
	}
	get merge() {
		const self: Matrix = this;
		return {
			left: (M: Matrix) => self.merge_left(M),
			right: (M: Matrix) => self.merge_right(M),
			top: (M: Matrix) => self.merge_top(M),
			bottom: (M: Matrix) => self.merge_bottom(M),
		};
	}
	get [Symbol.toStringTag]() {
		return `${this.rows}x${this.cols}`;
	}
	toString(): string {
		return `[${Array.prototype.toString.call(
			this.map((row) => `[${Array.prototype.toString.call(row)}]`)
		)}]`;
	}
	static fromArray(arr: number[][]) {
		return new Matrix(...arr);
	}
	static fromString(arr: string) {
		return Matrix.fromArray(JSON.parse(arr));
	}
}
