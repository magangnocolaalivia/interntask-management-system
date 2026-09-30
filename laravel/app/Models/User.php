<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role', // 'director', 'mentor', 'intern'
        'phone',
        'institution',
        'study_program',
        'division',
        'internship_start',
        'internship_end',
        'mentor_id',
        'profile_photo_path',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'internship_start' => 'date',
        'internship_end' => 'date',
    ];

    /**
     * Relationship: Tasks owned by this user (intern)
     */
    public function tasks()
    {
        return $this->hasMany(Task::class, 'user_id');
    }

    /**
     * Relationship: Tasks assigned by this user (mentor / director)
     */
    public function assignedTasks()
    {
        return $this->hasMany(Task::class, 'assigned_by');
    }

    /**
     * Relationship: Attendances recorded for this user (intern)
     */
    public function attendances()
    {
        return $this->hasMany(Attendance::class, 'user_id');
    }

    /**
     * Relationship: The mentor guiding this intern
     */
    public function mentor()
    {
        return $this->belongsTo(User::class, 'mentor_id');
    }

    /**
     * Relationship: Interns guided by this mentor
     */
    public function interns()
    {
        return $this->hasMany(User::class, 'mentor_id');
    }

    /**
     * Role Helper Methods
     */
    public function isDirector(): bool
    {
        return $this->role === 'director';
    }

    public function isMentor(): bool
    {
        return $this->role === 'mentor';
    }

    public function isIntern(): bool
    {
        return $this->role === 'intern';
    }
}
