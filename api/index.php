<?php

require __DIR__ . '/vendor/autoload.php';

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\Factory\AppFactory;
// use PDO;

$app = AppFactory::create();

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

// Database connection
$dbname = $_ENV['DB_NAME'];
$dsn = 'mysql:host=localhost;dbname=' . $dbname . ';charset=utf8mb4';
$username = $_ENV['DB_USER'];
$password = $_ENV['DB_PASSWORD'];
$options = [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
];
$pdo = new PDO($dsn, $username, $password, $options);

// Enable CORS
$app->add(function (Request $request, $handler) {
    $response = $handler->handle($request);
    return $response
        ->withHeader('Access-Control-Allow-Origin', '*')
        ->withHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        ->withHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
});

// GET: Fetch all results from database
$app->get('/results', function (Request $request, Response $response) use ($pdo) {
    $stmt = $pdo->query('SELECT * FROM user ORDER BY id DESC');
    $results = $stmt->fetchAll();

    $response->getBody()->write(json_encode($results));
    return $response->withHeader('Content-Type', 'application/json');
});

// POST: Submit a new result to the database
$app->post('/submit-solution', function (Request $request, Response $response) use ($pdo) {
    $data = json_decode($request->getBody()->getContents(), true);
    if (!isset($data['name']) || !isset($data['score'])) {
        return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
            // ->write(json_encode(['error' => 'Invalid input']));
    }

    $stmt = $pdo->prepare('INSERT INTO results (name, score) VALUES (:name, :score)');
    $stmt->execute(['name' => $data['name'], 'score' => $data['score']]);
    
    $newId = $pdo->lastInsertId();
    $newResult = ['id' => $newId, 'name' => $data['name'], 'score' => $data['score']];
    
    $response->getBody()->write(json_encode($newResult));
    return $response->withHeader('Content-Type', 'application/json');
});

$app->get('/test', function (Request $request, Response $response) {
    $response->getBody()->write('Hello, World!');
    return $response;
});

$app->run();
