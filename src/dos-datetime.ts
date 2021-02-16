const mask4 = 0b1111
const mask5 = 0b11111
const mask6 = 0b111111

export type DosDate = {
	year: number
	month: number
	day: number
}

export function parseDosDate(date: number): DosDate {
	return {
		day: date & mask5,
		month: (date >> 5) & mask4,
		year: 1980 + (date >> 9),
	}
}

export type DosTime = {
	hour: number
	minute: number
	second: number
}

export function parseDosTime(time: number): DosTime {
	return {
		second: (time & mask5) * 2,
		minute: (time >> 5) & mask6,
		hour: time >> 11,
	}
}
