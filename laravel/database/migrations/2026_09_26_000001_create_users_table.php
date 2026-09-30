<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->enum('role', ['director', 'mentor', 'intern'])->default('intern');
            $table->string('phone')->nullable();
            $table->string('institution')->nullable();
            $table->string('study_program')->nullable();
            $table->string('division')->nullable();
            $table->date('internship_start')->nullable();
            $table->date('internship_end')->nullable();
            $table->foreignId('mentor_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('profile_photo_path')->nullable();
            $table->rememberToken();
            $table->timestamps();

            $table->index(['role', 'mentor_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
