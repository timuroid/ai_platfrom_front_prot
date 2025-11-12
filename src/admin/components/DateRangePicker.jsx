import React, { useState, useRef, useEffect } from 'react'
import { Calendar, X } from 'lucide-react'
import './DateRangePicker.css'

const MONTHS = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
]

const DAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

function DateRangePicker({ startDate, endDate, onChange, placeholder = 'Выберите период' }) {
  const [isOpen, setIsOpen] = useState(false)
  const [tempStartDate, setTempStartDate] = useState(startDate)
  const [tempEndDate, setTempEndDate] = useState(endDate)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [hoverDate, setHoverDate] = useState(null)
  const dropdownRef = useRef(null)

  useEffect(() => {
    setTempStartDate(startDate)
    setTempEndDate(endDate)
  }, [startDate, endDate])

  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        handleCancel()
      }
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        handleCancel()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  const formatDate = (date) => {
    if (!date) return ''
    const d = new Date(date)
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = d.getFullYear()
    return `${day}.${month}.${year}`
  }

  const getDisplayValue = () => {
    if (startDate && endDate) {
      return `${formatDate(startDate)} — ${formatDate(endDate)}`
    }
    if (startDate) {
      return `${formatDate(startDate)} — ...`
    }
    return placeholder
  }

  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()

    // Получаем день недели для первого дня месяца (0 = воскресенье, нужно сделать понедельник = 0)
    let firstDayOfWeek = firstDay.getDay()
    firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1

    const days = []

    // Добавляем пустые ячейки для выравнивания
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null)
    }

    // Добавляем дни месяца
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }

    return days
  }

  const handleDateClick = (date) => {
    if (!tempStartDate || (tempStartDate && tempEndDate)) {
      // Начинаем новый выбор
      setTempStartDate(date)
      setTempEndDate(null)
    } else {
      // Выбираем конечную дату
      if (date < tempStartDate) {
        setTempEndDate(tempStartDate)
        setTempStartDate(date)
      } else {
        setTempEndDate(date)
      }
    }
  }

  const isDateInRange = (date) => {
    if (!date || !tempStartDate) return false

    const checkEndDate = hoverDate && !tempEndDate ? hoverDate : tempEndDate
    if (!checkEndDate) return false

    const start = tempStartDate < checkEndDate ? tempStartDate : checkEndDate
    const end = tempStartDate < checkEndDate ? checkEndDate : tempStartDate

    return date >= start && date <= end
  }

  const isDateSelected = (date) => {
    if (!date) return false
    return (
      (tempStartDate && date.toDateString() === tempStartDate.toDateString()) ||
      (tempEndDate && date.toDateString() === tempEndDate.toDateString())
    )
  }

  const isDateToday = (date) => {
    if (!date) return false
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  const handleApply = () => {
    if (tempStartDate && tempEndDate) {
      onChange(tempStartDate, tempEndDate)
      setIsOpen(false)
    }
  }

  const handleCancel = () => {
    setTempStartDate(startDate)
    setTempEndDate(endDate)
    setIsOpen(false)
  }

  const handleClear = () => {
    setTempStartDate(null)
    setTempEndDate(null)
    onChange(null, null)
    setIsOpen(false)
  }

  return (
    <div className="date-range-picker" ref={dropdownRef}>
      <button
        type="button"
        className="date-range-input"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={`date-range-value ${!startDate && !endDate ? 'placeholder' : ''}`}>
          {getDisplayValue()}
        </span>
        <Calendar size={16} />
      </button>

      {isOpen && (
        <div className="date-range-dropdown">
          <div className="date-range-header">
            <button
              type="button"
              className="date-range-nav-btn"
              onClick={handlePrevMonth}
            >
              ←
            </button>
            <div className="date-range-month">
              {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </div>
            <button
              type="button"
              className="date-range-nav-btn"
              onClick={handleNextMonth}
            >
              →
            </button>
          </div>

          <div className="date-range-calendar">
            <div className="date-range-weekdays">
              {DAYS.map((day) => (
                <div key={day} className="date-range-weekday">
                  {day}
                </div>
              ))}
            </div>

            <div className="date-range-days">
              {getDaysInMonth(currentMonth).map((date, index) => (
                <button
                  key={index}
                  type="button"
                  className={`date-range-day ${!date ? 'empty' : ''} ${
                    isDateSelected(date) ? 'selected' : ''
                  } ${isDateInRange(date) ? 'in-range' : ''} ${
                    isDateToday(date) ? 'today' : ''
                  }`}
                  onClick={() => date && handleDateClick(date)}
                  onMouseEnter={() => date && setHoverDate(date)}
                  disabled={!date}
                >
                  {date ? date.getDate() : ''}
                </button>
              ))}
            </div>
          </div>

          <div className="date-range-footer">
            <button
              type="button"
              className="date-range-btn btn-clear"
              onClick={handleClear}
            >
              Очистить
            </button>
            <div className="date-range-footer-actions">
              <button
                type="button"
                className="date-range-btn btn-cancel"
                onClick={handleCancel}
              >
                Отмена
              </button>
              <button
                type="button"
                className="date-range-btn btn-apply"
                onClick={handleApply}
                disabled={!tempStartDate || !tempEndDate}
              >
                Применить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DateRangePicker
