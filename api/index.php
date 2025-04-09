<?php

require __DIR__ . '/vendor/autoload.php';

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Server\RequestHandlerInterface as RequestHandler;
use Slim\Factory\AppFactory;
use Firebase\JWT\JWT;

// START THE LOCAL SERVER:
// php -S localhost:8000 -t .

$app = AppFactory::create();

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

$apiPrefix = $_ENV['API_PREFIX'];

// Database connection
$dbname = $_ENV['DB_NAME'];
$dbhost = $_ENV['DB_HOST'];
$dsn = 'mysql:host=' . $dbhost . ';dbname=' . $dbname . ';charset=utf8mb4';
$username = $_ENV['DB_USER'];
$password = $_ENV['DB_PASSWORD'];
$options = [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
];
$pdo = new PDO($dsn, $username, $password, $options);

function createPreflightReponse(Response $response, $status = 200) {
    return $response
        ->withHeader('Access-Control-Allow-Origin', 'http://localhost:4200')
        ->withHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        ->withHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        // ->withStatus($status);
};

function createInvalidInputResponse(Response $response) {
    $error = array('error' => 'INVALID_INPUT', 'status' => 400);
        $response->getBody()->write(json_encode($error));
        return $response->withStatus(400)
            ->withHeader('Content-Type', 'application/json');
}

function createUnauthorizedResponse(Response $response) {
    global $app;
    $error = array('error' => 'UNAUTHORIZED', 'status' => 401);
    $response = $app->getResponseFactory()->createResponse();
    $response->getBody()->write(json_encode($error));
    return $response->withStatus(401)->withHeader('Content-Type', 'application/json');
}

function authMiddleware(Request $request, RequestHandler $handler) {
    $authHeader = $request->getHeader('Authorization');

    if (!$authHeader || !preg_match('/Bearer\s+(.*)/', $authHeader[0], $matches)) {
        return createUnauthorizedResponse(new \Slim\Psr7\Response());
    }

    $jwt = $matches[1];

    try {
        $decoded = JWT::decode($jwt, $_ENV["JWT_SECRET"], array('HS256'));
        $request = $request->withAttribute('user', $decoded->context->user);
    } catch (Exception $e) {
        echo "Error " . $e->getMessage();
        return createUnauthorizedResponse(new \Slim\Psr7\Response());
    }

    return $handler->handle($request);
}

$app->add(function (Request $request, $handler) {
    $response = new \Slim\Psr7\Response();

    // $response = $handler->handle($request);

    if ($request->getMethod() === 'OPTIONS') {
        return createPreflightReponse($response, 204);
    }

    return createPreflightReponse($handler->handle($request));
});

// Handle preflight (OPTIONS) requests
$app->options($apiPrefix . '/{routes:.+}', function (Request $request, Response $response) {
    return createPreflightReponse($response, 204);
});

// GET: Fetch all results from database
$app->get($apiPrefix . '/users', function (Request $request, Response $response) use ($pdo) {
    $stmt = $pdo->query('SELECT * FROM user WHERE login = 0 ORDER BY id DESC');
    $results = $stmt->fetchAll();

    $response->getBody()->write(json_encode($results));
    return $response->withHeader('Content-Type', 'application/json');
});

// GET: Fetch all Ciphers from database order by date desc
$app->get($apiPrefix . '/ciphers', function (Request $request, Response $response) use ($pdo) {
    $stmt = $pdo->query('SELECT * FROM cipher ORDER BY number');
    $results = $stmt->fetchAll();

    $response->getBody()->write(json_encode($results));
    return $response->withHeader('Content-Type', 'application/json');
});

// GET: Fetch all Active Ciphers from database, order by number
$app->get($apiPrefix . '/ciphers/active', function (Request $request, Response $response) use ($pdo) {
    $stmt = $pdo->query('SELECT * FROM cipher WHERE active=1 ORDER BY created DESC, number DESC');
    $results = $stmt->fetchAll();

    $response->getBody()->write(json_encode($results));
    return $response->withHeader('Content-Type', 'application/json');
});

// GET: Fetch all solutions from database ordered by the most successfull users
$app->get($apiPrefix . '/results', function (Request $request, Response $response) use ($pdo) {
    $stmt = $pdo->query('SELECT user.name, COUNT(solution.correct) as correct FROM solution JOIN user ON solution.user_id = user.id WHERE solution.correct = 1 GROUP BY user.name ORDER BY correct DESC');
    $results = $stmt->fetchAll();

    $response->getBody()->write(json_encode($results));
    return $response->withHeader('Content-Type', 'application/json');
});

// POST: Submit a new result to the database
$app->post($apiPrefix . '/check', function (Request $request, Response $response) use ($pdo) {
    $data = json_decode($request->getBody()->getContents(), true);
    
    if (!isset($data['solution'])
        || !isset($data['cipherId'])
        || empty($data['solution'])
        || !is_numeric($data['cipherId'])
    ) {
        return createInvalidInputResponse($response);
    }

    // make some SQL injection prevention
    $data['solution'] = htmlspecialchars($data['solution']);
    $data['cipherId'] = htmlspecialchars($data['cipherId']);
    $data['name'] = isset($data['name']) ? htmlspecialchars($data['name']) : '';

    // get the cipher from the database
    $stmt = $pdo->prepare('SELECT * FROM cipher WHERE id = :id');
    $stmt->execute(['id' => $data['cipherId']]);
    $cipher = $stmt->fetch();

    $data['solution'] = convertSolution($data['solution']);
    $cipher['realSolution'] = convertSolution($cipher['realSolution']);

    // compare the solution with the correct answer
    $correct = $cipher['realSolution'] === $data['solution'];

    // echo $cipher['realSolution'] . ' ' . $data['solution'] . ' ' . $correct;
    // convert the boolean to an integer
    $correct = $correct ? 1 : 0;

    // insert the result into the database if there is a name
    if (isset($data['name']) && !empty($data['name'])) {
        // first try to find the user in the database
        $stmt = $pdo->prepare('SELECT * FROM user WHERE name = :name');
        $stmt->execute(['name' => $data['name']]);
        $user = $stmt->fetch();
        $userId = -1;

        // if the user does not exist, create a new user
        if (!$user) {
            $stmt = $pdo->prepare('INSERT INTO user (name) VALUES (:name)');
            $stmt->execute(['name' => $data['name']]);

            // save the user id
            $userId = $pdo->lastInsertId();
        } else {
            $userId = $user['id'];
        }

        // check if the solution already exists
        $stmt = $pdo->prepare('SELECT * FROM solution WHERE value = :value AND user_id = :user_id AND cipher_id = :cipher_id');
        $stmt->execute(['value' => $data['solution'], 'user_id' => $userId, 'cipher_id' => $data['cipherId']]);
        $result = $stmt->fetch();

        if ($result) {
            // solution already exists, return error
            $error = array('error' => 'SOLUTION_EXISTS', 'status' => 200);
            $response->getBody()->write(json_encode($error));
            return $response->withHeader('Content-Type', 'application/json');
        }
        
        // save the result
        $stmt = $pdo->prepare('INSERT INTO solution (value, user_id, cipher_id, correct) VALUES (:value, :user_id, :cipher_id, :correct)');
        $stmt->execute(['value' => $data['solution'], 'user_id' => $userId, 'cipher_id' => $data['cipherId'], 'correct' => $correct]);

        $newResult = array('id' => $pdo->lastInsertId(), 'user_id' => $userId, 'cipher_id' => $data['cipherId'], 'correct' => $correct);
        $response->getBody()->write(json_encode($newResult));
        return $response->withHeader('Content-Type', 'application/json');
    } else {
        // just return the result if the solution is correct
        $newResult = array('correct' => $correct);
        $response->getBody()->write(json_encode($newResult));
        return $response->withHeader('Content-Type', 'application/json');
    }
});

// LOGIN
$app->post($apiPrefix . '/login', function (Request $request, Response $response) use ($pdo) {
    $data = json_decode($request->getBody()->getContents(), true);

    if (!isset($data['name']) || !isset($data['password']) || empty($data['name']) || empty($data['password'])) {
        return createInvalidInputResponse($response);
    }

    // get the user from the database
    $stmt = $pdo->prepare('SELECT * FROM user WHERE name = :name AND login = 1');
    $stmt->execute(['name' => $data['name']]);
    $user = $stmt->fetch();

    if (!$user) {
        return createUnauthorizedResponse($response);
    }

    // verify password
    if (!password_verify($data['password'], $user['password'])) {
        return createUnauthorizedResponse($response);
    }

    // generate a new token
    $payload = array(
        "iat" => time(),
        "exp" => time() + (3600 * 24 * 7), // 24 h
        "context" =>[
            "user" => [
                "username" => $user["name"],
                "id" => $user["id"]
            ]
        ]
    );
    
    $token = JWT::encode($payload, $_ENV["JWT_SECRET"]);

    $response->getBody()->write(json_encode($token));
    return $response->withHeader('Content-Type', 'application/json');
});

// ADD CIPHER
$app->post($apiPrefix . '/ciphers', function (Request $request, Response $response) use ($pdo) {
    $data = json_decode($request->getBody()->getContents(), true);

    if (!isCipherValid($data)) {
        return createInvalidInputResponse($response);
    }

    $data = setDefaultCipherValues($data);

    // check if the cipher already exists, check name and number
    $stmt = $pdo->prepare('SELECT * FROM cipher WHERE name = :name OR number = :number');
    $stmt->execute(['name' => $data['name'], 'number' => $data['number']]);
    $cipher = $stmt->fetch();

    if ($cipher) {
        // cipher already exists, return error
        $error = array('error' => 'CIPHER_EXISTS', 'status' => 200);
        $response->getBody()->write(json_encode($error));
        return $response->withHeader('Content-Type', 'application/json');
    }

    // insert the cipher into the database
    $stmt = $pdo->prepare('INSERT INTO cipher (active, number, name, created, realSolution, image) VALUES (:active, :number, :name, :created, :realSolution, :image)');
    $stmt->execute([
        'active' => $data['active'] ? 1 : 0,
        'number' => $data['number'],
        'name' => $data['name'],
        'created' => $data['created'],
        'realSolution' => $data['realSolution'],
        'image' => $data['image']
    ]);

    $response->getBody()->write($pdo->lastInsertId());
    return $response->withHeader('Content-Type', 'application/json');
});

// UPDATE CIPHER
$app->put($apiPrefix . '/ciphers', function (Request $request, Response $response) use ($pdo) {
    $data = json_decode($request->getBody()->getContents(), true);

    if (!isCipherValid($data) || !isset($data['id']) || !is_numeric($data['id'])) {
        return createInvalidInputResponse($response);
    }

    $data = setDefaultCipherValues($data);

    // check if the cipher already exists, check name and number, don't forget to exclude the current cipher
    $stmt = $pdo->prepare('SELECT * FROM cipher WHERE (name = :name OR number = :number) AND id != :id');
    $stmt->execute(['name' => $data['name'], 'number' => $data['number'], 'id' => $data['id']]);
    $cipher = $stmt->fetch();

    if ($cipher) {
        // cipher already exists, return error
        $error = array('error' => 'CIPHER_EXISTS', 'status' => 200);
        $response->getBody()->write(json_encode($error));
        return $response->withHeader('Content-Type', 'application/json');
    }

    // update the cipher in the database
    $stmt = $pdo->prepare('UPDATE cipher SET active = :active, number = :number, name = :name, created = :created, realSolution = :realSolution, image = :image WHERE id = :id');
    $stmt->execute([
        'active' => $data['active'] ? 1 : 0,
        'number' => $data['number'],
        'name' => $data['name'],
        'created' => $data['created'],
        'realSolution' => $data['realSolution'],
        'image' => $data['image'],
        'id' => $data['id']
    ]);

    $response->getBody()->write(strval($data['id']));
    return $response->withHeader('Content-Type', 'application/json');
});

// DELETE CIPHER
$app->delete($apiPrefix . '/ciphers/{id}', function (Request $request, Response $response, $args) use ($pdo) {
    $id = $args['id'];

    // delete the cipher from the database
    $stmt = $pdo->prepare('DELETE FROM cipher WHERE id = :id');
    $stmt->execute(['id' => $id]);

    $response->getBody()->write(strval($id));
    return $response->withHeader('Content-Type', 'application/json');
});

function isCipherValid($data) {
    if (!isset($data['name']) || !isset($data['realSolution']) || !isset($data['number'])
        || empty($data['name']) || empty($data['realSolution']) || empty($data['number'])
        || !is_numeric($data['number'])) {
        return false;
    }    

    return true;
}

function setDefaultCipherValues($data) {
    if (!isset($data['created']) || empty($data['created'])) {
        $data['created'] = date('Y-m-d');
    }

    if (!isset($data['active'])) {
        echo 'active';
        $data['active'] = 1;
    }

    if (!isset($data['image']) || empty($data['image'])) {
        $data['image'] = 'empty.png';
    }

    // make some SQL injection prevention
    $data['name'] = htmlspecialchars($data['name']);
    $data['realSolution'] = htmlspecialchars($data['realSolution']);
    $data['image'] = htmlspecialchars($data['image']);

    return $data;
}

function convertSolution($solution) {
    $solution = mb_strtolower($solution);

    // replace all czech characters with their english counterparts
    $czChars = array('á', 'č', 'ď', 'é', 'ě', 'í', 'ň', 'ó', 'ř', 'š', 'ť', 'ú', 'ů', 'ý', 'ž');
    $enChars = array('a', 'c', 'd', 'e', 'e', 'i', 'n', 'o', 'r', 's', 't', 'u', 'u', 'y', 'z');
    $solution = str_replace($czChars, $enChars, $solution);

    // remove all interputations
    $chars = array('!', '?', ',', '.');
    $solution = str_replace($chars, '', $solution);

    // trim whitespaces at the beginning and end
    $solution = trim($solution);

    return $solution;
}

$app->get($apiPrefix . '/test', function (Request $request, Response $response) {
    $response->getBody()->write('Hello, World!');
    return $response;
})->add('authMiddleware');


// Default route
$app->map(['GET', 'POST', 'OPTIONS'], $apiPrefix . '/', function (Request $request, Response $response) {
    $response->getBody()->write('Empty!');
    return $response->withHeader('Content-Type', 'text/plain');
});

$app->run();