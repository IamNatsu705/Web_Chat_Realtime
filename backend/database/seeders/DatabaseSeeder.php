<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            UserSeeder::class,
            FriendshipSeeder::class,
            ConversationSeeder::class,
            PostSeeder::class,
            StreakSeeder::class,
        ]);
        
        $this->command->info('✅ Seeded modular test data successfully.');
    }
}
