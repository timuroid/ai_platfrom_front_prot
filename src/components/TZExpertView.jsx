import React, { useState, useRef } from 'react'
import { Upload, FileText, X } from 'lucide-react'

export default function TZExpertView() {
  const [file, setFile] = useState(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef(null)

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      setFile(droppedFile)
    }
  }

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      setFile(selectedFile)
    }
  }

  const handleRemoveFile = () => {
    setFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <div className="tz-expert-container">
      <div className="tz-expert-content">
        <h1 className="tz-expert-title">ТЗ-эксперт</h1>
        <p className="tz-expert-subtitle">
          Загрузите документ с техническим заданием для анализа
        </p>

        <div
          className={`tz-upload-zone ${isDragOver ? 'is-drag-over' : ''} ${file ? 'has-file' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !file && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.txt,.rtf"
            onChange={handleFileSelect}
            className="tz-file-input"
          />

          {file ? (
            <div className="tz-file-preview">
              <div className="tz-file-icon">
                <FileText size={32} />
              </div>
              <div className="tz-file-info">
                <span className="tz-file-name">{file.name}</span>
                <span className="tz-file-size">{formatFileSize(file.size)}</span>
              </div>
              <button
                type="button"
                className="tz-file-remove"
                onClick={(e) => {
                  e.stopPropagation()
                  handleRemoveFile()
                }}
              >
                <X size={18} />
              </button>
            </div>
          ) : (
            <div className="tz-upload-placeholder">
              <div className="tz-upload-icon">
                <Upload size={48} />
              </div>
              <p className="tz-upload-text">
                Перетащите файл сюда или нажмите для выбора
              </p>
              <p className="tz-upload-hint">
                Поддерживаемые форматы: PDF, DOC, DOCX, TXT, RTF
              </p>
            </div>
          )}
        </div>

        {file && (
          <button type="button" className="tz-analyze-button">
            Анализировать документ
          </button>
        )}
      </div>
    </div>
  )
}
