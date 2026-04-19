// ──────────────────────────────────────────────
//  BuRegDes Next — Book Constants
//  (update Session 2: shortName, DEFAULT_YEAR)
// ──────────────────────────────────────────────

import type { BookDef } from '@/types';

export const BOOKS: BookDef[] = [
  {
    id: 'A.1',
    name: 'Buku Peraturan di Desa',
    shortName: 'Peraturan Desa',
    columns: [
      { key: 'no', label: 'No', type: 'number', width: 48 },
      { key: 'nomorPeraturan', label: 'Nomor Peraturan', type: 'mono', width: 140 },
      { key: 'tentang', label: 'Tentang', type: 'text' },
      { key: 'tanggalPenetapan', label: 'Tgl Penetapan', type: 'date', width: 110 },
      { key: 'keterangan', label: 'Keterangan', type: 'text' },
    ],
  },
  {
    id: 'A.2',
    name: 'Buku Keputusan Kepala Desa',
    shortName: 'Keputusan Kades',
    columns: [
      { key: 'no', label: 'No', type: 'number', width: 48 },
      { key: 'nomorKeputusan', label: 'Nomor SK', type: 'mono', width: 140 },
      { key: 'tentang', label: 'Tentang', type: 'text' },
      { key: 'tanggalPenetapan', label: 'Tgl Penetapan', type: 'date', width: 110 },
      { key: 'keterangan', label: 'Keterangan', type: 'text' },
    ],
  },
  {
    id: 'A.3',
    name: 'Buku Inventaris dan Kekayaan Desa',
    shortName: 'Inventaris Desa',
    columns: [
      { key: 'no', label: 'No', type: 'number', width: 48 },
      { key: 'namaBarang', label: 'Nama Barang', type: 'text' },
      { key: 'jumlah', label: 'Jumlah', type: 'number', width: 80 },
      { key: 'satuan', label: 'Satuan', type: 'text', width: 80 },
      { key: 'kondisi', label: 'Kondisi', type: 'text', width: 100 },
      { key: 'keterangan', label: 'Keterangan', type: 'text' },
    ],
  },
  {
    id: 'A.4',
    name: 'Buku Aparat Pemerintah Desa',
    shortName: 'Aparat Desa',
    columns: [
      { key: 'no', label: 'No', type: 'number', width: 48 },
      { key: 'nama', label: 'Nama', type: 'text' },
      { key: 'jabatan', label: 'Jabatan', type: 'text', width: 150 },
      { key: 'pendidikan', label: 'Pendidikan', type: 'text', width: 110 },
      { key: 'tanggalLahir', label: 'Tgl Lahir', type: 'date', width: 110 },
      { key: 'keterangan', label: 'Keterangan', type: 'text' },
    ],
  },
  {
    id: 'A.5',
    name: 'Buku Tanah Kas Desa',
    shortName: 'Tanah Kas Desa',
    columns: [
      { key: 'no', label: 'No', type: 'number', width: 48 },
      { key: 'lokasi', label: 'Lokasi / Blok', type: 'text' },
      { key: 'luasM2', label: 'Luas (m²)', type: 'number', width: 100 },
      { key: 'jenisHak', label: 'Jenis Hak', type: 'text', width: 110 },
      { key: 'penggunaan', label: 'Penggunaan', type: 'text' },
      { key: 'keterangan', label: 'Keterangan', type: 'text' },
    ],
  },
  {
    id: 'A.6',
    name: 'Buku Agenda',
    shortName: 'Agenda',
    columns: [
      { key: 'no', label: 'No', type: 'number', width: 48 },
      { key: 'tanggal', label: 'Tanggal', type: 'date', width: 110 },
      { key: 'nomorSurat', label: 'Nomor Surat', type: 'mono', width: 140 },
      { key: 'dariKepada', label: 'Dari / Kepada', type: 'text' },
      { key: 'perihal', label: 'Perihal', type: 'text' },
      { key: 'keterangan', label: 'Keterangan', type: 'text' },
    ],
  },
];

// Build tahun 5 tahun ke belakang s/d tahun ini
const currentYear = new Date().getFullYear();
export const YEARS: string[] = Array.from({ length: 6 }, (_, i) =>
  String(currentYear - i)
);

export const DEFAULT_YEAR = String(currentYear);

export const DEFAULT_ROWS = 10;
