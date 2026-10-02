<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use Illuminate\Support\Collection;

class TasksExport implements FromCollection, WithHeadings, WithMapping, ShouldAutoSize, WithStyles
{
    protected Collection $tasks;
    protected $company;
    protected $user;

    public function __construct($tasks, $company = null, $user = null)
    {
        $this->tasks = $tasks instanceof Collection ? $tasks : collect($tasks);
        $this->company = $company;
        $this->user = $user;
    }

    /**
     * @return Collection
     */
    public function collection(): Collection
    {
        return $this->tasks;
    }

    /**
     * @return array
     */
    public function headings(): array
    {
        return [
            'ID',
            'Tanggal',
            'Nama Peserta',
            'Institusi',
            'Judul Tugas',
            'Kategori',
            'Prioritas',
            'Estimasi Durasi (Jam)',
            'Progres (%)',
            'Status',
            'Hasil Pengerjaan',
            'Kendala',
            'Tautan Repository',
            'Tautan Deployment',
            'Tautan Figma',
            'Terakhir Diperbarui',
        ];
    }

    /**
     * @param mixed $task
     * @return array
     */
    public function map($task): array
    {
        return [
            $task->id,
            $task->task_date,
            $task->user->name ?? '-',
            $task->user->institution ?? '-',
            $task->title,
            $task->category,
            $task->priority,
            $task->estimated_duration ?? 4,
            $task->progress . '%',
            $task->status,
            $task->result ?? '-',
            $task->obstacles ?? '-',
            $task->repository_link ?? '-',
            $task->deployment_link ?? '-',
            $task->figma_link ?? '-',
            $task->updated_at ? $task->updated_at->format('Y-m-d H:i') : '-',
        ];
    }

    /**
     * @param Worksheet $sheet
     * @return array
     */
    public function styles(Worksheet $sheet): array
    {
        return [
            1 => [
                'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
                'fill' => [
                    'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                    'startColor' => ['rgb' => '0D9488'], // Teal 600
                ],
            ],
        ];
    }
}
