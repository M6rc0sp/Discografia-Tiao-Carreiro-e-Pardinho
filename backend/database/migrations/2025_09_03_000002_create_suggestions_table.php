<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('suggestions', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('youtube_link')->unique();
            // optional youtube id extracted from the link
            $table->string('youtube_id')->nullable();
            // single status column instead of separate booleans (pending|approved|rejected)
            $table->string('status')->default('pending');
            // keep historical timestamps for when a suggestion was approved/rejected
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('rejected_at')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('suggestions');
    }
};
