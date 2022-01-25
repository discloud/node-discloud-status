/*
Copyright 2019-2021 Discloud
Todos os direitos reservados.

AVISO: A Discloud permite que você use, modifique e distribua esse arquivo em
de acordo com os termos do contrato de licença que acompanha
isto. Se você recebeu este arquivo de uma fonte diferente da Discloud,
então seu uso, modificação ou distribuição exige a prévia
permissão por escrito da Discloud.
*/

const fs = require('fs');

function ram() {
    try {
        let usoBytes = fs.readFileSync(`/sys/fs/cgroup/memory/memory.max_usage_in_bytes`).toString();
        let totalBytes = fs.readFileSync(`/sys/fs/cgroup/memory/memory.limit_in_bytes`).toString();
        return formatoMb(usoBytes) + '/' + formatoMb(totalBytes) + 'MB'
    } catch (err) {
        throw new Error("Dados não encontrados")
    }
}
function usoRam() {
    try {
        let usoBytes = fs.readFileSync(`/sys/fs/cgroup/memory/memory.max_usage_in_bytes`).toString();//588132352
        return converter(usoBytes)
    } catch (err) {
        throw new Error("Dados não encontrados")
    }
}
function totalRam() {
    try {
        let totalBytes = fs.readFileSync(`/sys/fs/cgroup/memory/memory.limit_in_bytes`).toString(); //1400897536
        return converter(totalBytes)
    } catch (err) {
        throw new Error("Dados não encontrados")
    }
}

function converter(bytes) {
    let formatos = ['B', 'KB', 'MB', 'GB', 'TB'];
    if (bytes == 0) return '0B';
    let i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    if (i <= 2) return Math.round(bytes / Math.pow(1024, i), 2) + formatos[i];
    if ((bytes / Math.pow(1024, i)).toFixed(3).includes(".00")) return Math.round(bytes / Math.pow(1024, i), 2) + formatos[i];
    if ((bytes / Math.pow(1024, i)).toFixed(3).includes(".0")) return ((bytes / Math.pow(1024, i)).toFixed(3) + formatos[i]).replace("0", "")
    return (bytes / Math.pow(1024, i)).toFixed(3) + formatos[i];
}

function formatoMb(bytes) {
    return Math.round(bytes / Math.pow(1024, 2), 2);
}

const axios = require('axios');
const FormData = require('form-data')

class APIstatus {
    constructor(token) {
        this.token = token;
        this.instance = axios.create({
            baseURL: 'https://discloud.app/status',
            timeout: 5000,
            headers: { 'api-token': this.token }
        });
    }
    getUser() {
        return new Promise((res, rej) => {
            this.instance.get("/user").then(x => res(x.data))
                .catch(err => rej(err))
        })
    }
    getBot(id) {
        return new Promise((res, rej) => {
            if (id == undefined) {return rej("Need bot id")}
            this.instance.get(`/bot/${id}`).then(x => res(x.data))
                .catch(err => rej(err))
        })
    }
    getBotLogs(id) {
        return new Promise((res, rej) => {
            if (id == undefined) {return rej("Need bot id")}
            this.instance.get(`/bot/${id}/logs`).then(x => res(x.data))
                .catch(err => rej(err))
        })
    }
    postBotRestart(id = undefined) {
        return new Promise((res, rej) => {
            if (id == undefined) {return rej("Need bot id")}
            this.instance.post(`/bot/${id}/restart`).then(x => res(x.data))
                .catch(err => rej(err))
        })
    }
    postBotCommit(id, pathZip, restartBot = false) {
        return new Promise((res, rej) => {
            if (id == undefined) {return rej("Need bot id")}
            if (pathZip == undefined) {return rej("Need path zip")}
            const fileZip = fs.createReadStream(pathZip).catch(err => rej(err))
            let form = new FormData();
            form.append('file', fileZip);
            this.instance.post(`/bot/${id}/commit?restart=${restartBot}`, form, {
                headers: form.getHeaders({ 'api-token': this.token })
            }).then(x => res(x.data))
                .catch(err => rej(err))
        })
    }

}

module.exports = {
    usoRam,
    totalRam,
    ram,
    APIstatus
}
