import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export default function DatePickerComponent({ selectedDate, setSelectedDate, instruction }) {

    return (
        <div className="flex justify-center items-center bg-black">
            <div className="p-4 bg-gray-800 rounded-lg shadow-lg">
                <h2 className="text-white text-2xl mb-4">{instruction}</h2>
                <DatePicker
                    selected={selectedDate}
                    onChange={date => setSelectedDate(date)}
                    className="w-full p-2 rounded-lg bg-gray-700 text-white placeholder-gray-400"
                    placeholderText="Click to select a date"
                    calendarClassName="bg-gray-700 text-white"
                    dayClassName={date =>
                        "cursor-pointer bg-gray-700 text-white hover:bg-gray-600"
                    }
                    popperClassName="react-datepicker-popper"
                    todayButton="Today"
                    renderCustomHeader={({
                        date,
                        changeYear,
                        changeMonth,
                        decreaseMonth,
                        increaseMonth,
                        prevMonthButtonDisabled,
                        nextMonthButtonDisabled,
                    }) => (
                        <div className="flex items-center justify-between px-2 py-2">
                            <button
                                onClick={decreaseMonth}
                                disabled={prevMonthButtonDisabled}
                                className="text-lg text-white focus:outline-none"
                            >
                                {'<'}
                            </button>
                            <div className="flex items-center">
                                <select
                                    value={date.getFullYear()}
                                    onChange={({ target: { value } }) => changeYear(value)}
                                    className="mr-2 p-1 bg-gray-600 text-white rounded-lg focus:outline-none"
                                >
                                    {Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i).map(year => (
                                        <option key={year} value={year}>
                                            {year}
                                        </option>
                                    ))}
                                </select>
                                <select
                                    value={date.getMonth()}
                                    onChange={({ target: { value } }) => changeMonth(value)}
                                    className="p-1 bg-gray-600 text-white rounded-lg focus:outline-none"
                                >
                                    {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(
                                        (month, index) => (
                                            <option key={month} value={index}>
                                                {month}
                                            </option>
                                        )
                                    )}
                                </select>
                            </div>
                            <button
                                onClick={increaseMonth}
                                disabled={nextMonthButtonDisabled}
                                className="text-lg text-white focus:outline-none"
                            >
                                {'>'}
                            </button>
                        </div>
                    )}
                />
            </div>
        </div>
    );
}