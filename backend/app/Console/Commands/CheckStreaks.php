<?php

namespace App\Console\Commands;

use App\Services\Chat\StreakServiceInterface;
use Illuminate\Console\Command;

class CheckStreaks extends Command
{
    protected $signature = 'streaks:check';
    protected $description = 'Check all active streaks and handle missed days (run daily at 00:00)';

    public function __construct(protected StreakServiceInterface $streakService)
    {
        parent::__construct();
    }

    public function handle(): int
    {
        $this->info('Checking streaks...');
        $this->streakService->checkAllStreaks();
        $this->info('Streak check completed.');
        return Command::SUCCESS;
    }
}
