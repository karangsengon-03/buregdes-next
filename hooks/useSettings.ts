// ─────────────────────────────────────────────
// BuRegDes Next — useSettings hook (Session 6, Fixed)
// Bundle state pengaturan aplikasi:
// - Info Desa (via useDesaInfo)
// - Tahun aktif (via useApp)
// - App version / about
// ─────────────────────────────────────────────

import { useApp }      from '@/contexts/AppContext'
import { useDesaInfo } from '@/hooks/useDesaInfo'
import { YEARS }       from '@/constants/books'

export const APP_VERSION = '1.0.0'
export const APP_NAME    = 'BuRegDes Next'
export const APP_DESC    = 'Buku Register Administrasi Desa Digital'

// Gunakan YEARS dari constants (string[]) agar konsisten dengan activeYear: string
export function getAvailableYears(): string[] {
  return YEARS
}

export interface UseSettingsReturn {
  // Info desa
  desaInfo:        ReturnType<typeof useDesaInfo>['desaInfo']
  desaStatus:      ReturnType<typeof useDesaInfo>['status']
  updateDesaInfo:  ReturnType<typeof useDesaInfo>['updateDesaInfo']
  isDesaComplete:  boolean

  // Tahun aktif — string sesuai AppContext
  activeYear:      string
  availableYears:  string[]
  setActiveYear:   (year: string) => void

  // Online status
  isOnline:        boolean

  // Toast helper
  showToast:       ReturnType<typeof useApp>['showToast']
}

export function useSettings(): UseSettingsReturn {
  const { activeYear, setActiveYear, isOnline, showToast } = useApp()
  const { desaInfo, status: desaStatus, updateDesaInfo }   = useDesaInfo()

  const isDesaComplete = Boolean(
    desaInfo.desa &&
    desaInfo.kecamatan &&
    desaInfo.kabupaten &&
    desaInfo.provinsi &&
    desaInfo.tahun
  )

  return {
    desaInfo,
    desaStatus,
    updateDesaInfo,
    isDesaComplete,
    activeYear,
    availableYears: getAvailableYears(),
    setActiveYear,
    isOnline,
    showToast,
  }
}
