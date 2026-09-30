<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    use HasFactory;

    protected $table = 'tasks';

    protected $fillable = [
        'user_id',
        'assigned_by',
        'is_assigned',
        'mentor_attachment_path',
        'mentor_reference_url',
        'title',
        'description',
        'task_date',
        'deadline',
        'category',
        'priority',
        'estimated_duration',
        'progress',
        'status',
        'result',
        'obstacles',
        'repository_link',
        'deployment_link',
        'figma_link',
    ];

    protected $casts = [
        'is_assigned' => 'boolean',
        'progress' => 'integer',
        'estimated_duration' => 'float',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function assigner()
    {
        return $this->belongsTo(User::class, 'assigned_by');
    }
}
