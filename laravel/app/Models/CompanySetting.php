<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CompanySetting extends Model
{
    use HasFactory;

    protected $table = 'company_settings';

    protected $fillable = [
        'company_name',
        'company_address',
        'company_logo_path',
        'late_tolerance_time',
    ];

    protected $attributes = [
        'late_tolerance_time' => '09:00',
    ];
}
