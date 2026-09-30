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
        Schema::create('tasks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('assigned_by')->nullable()->constrained('users')->onDelete('set null');
            $table->boolean('is_assigned')->default(false);
            $table->string('mentor_attachment_path')->nullable();
            $table->string('mentor_reference_url')->nullable();
            $table->string('title');
            $table->text('description');
            $table->date('task_date');
            $table->string('deadline');
            $table->string('category')->default('Development');
            $table->string('priority')->default('Medium');
            $table->float('estimated_duration')->default(4);
            $table->integer('progress')->default(0);
            $table->enum('status', [
                'Draft',
                'In Progress',
                'Submitted',
                'Review',
                'Revision',
                'Approved',
                'Completed',
                'Rejected'
            ])->default('In Progress');
            $table->text('result')->nullable();
            $table->text('obstacles')->nullable();
            $table->string('repository_link')->nullable();
            $table->string('deployment_link')->nullable();
            $table->string('figma_link')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tasks');
    }
};
