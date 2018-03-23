const child_process = require('child_process');
const fs = require('fs');
const ganache = require('ganache-cli');

const configuration = {
    accounts:
        [
            {
                // address:'0x627306090abaB3A6e1400e9345bC60c78a8BEf57',
                secretKey: '0xc87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3',
                balance: '0xd3c21bcecceda0000000', // 1000000000000000000000000
            },
            {
                // address:'0xf17f52151EbEF6C7334FAD080c5704D77216b732',
                secretKey: '0xae6ae8e5ccbfb04590405997ee2d52d2b330726137b875053c36d94e974d162f',
                balance: '0xd3c21bcecceda0000000', // 1000000000000000000000000
            },
            {
                // address:'0xC5fdf4076b8F3A5357c5E395ab970B5B54098Fef',
                secretKey: '0x0dbbe8e4ae425a6d2687f1a7e3ba17bc98c673636790f1b8ad91193c05875ef1',
                balance: '0xd3c21bcecceda0000000', // 1000000000000000000000000
            }
        ]
};

var server;
var socket;
var files = [];

fs.readdirSync('./test').forEach(function (item) {
    if (item.endsWith('.js'))
        files.push('./test/' + item);
});
files.sort().reverse();

function start_server() {
    if (files.length) {
        if (server && server.listening) {
            return server.close(start_server);
        }
        if (socket && ! socket.destroyed) {
            socket.destroy();
        }
        server = ganache.server(configuration);
        server.on('connection', function (s) {
            socket = s;
        });
        server.listen(7545, next_test);
    }
}

function next_test(err, blockchain) {
    if (err) throw err;

    var file = files.pop();
    console.log(file);
    child_process.exec('node ./node_modules/truffle/build/cli.bundled.js test ' + file, function (e, stdout, stderr) {
        console.log(stdout.substr(stdout.indexOf('Contract: ')));
        if (stderr) console.log('errors', stderr);
        if (e) console.log('e', e);
        server.close(start_server);
    });
}

start_server();