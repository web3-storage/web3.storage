import * as http from 'http'

// Add API token here.
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDZDMzhDNDJBOWUyRWYyNTk4OUJFMTY0NkIwZTQyNDg0ZDczNzgzMTQiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2NTYwODI0MzY5NTgsIm5hbWUiOiJ3dyJ9.MvD7eqyrQEXjHv_Y_tb5bUdZMtmEjB8wAmjnC6ZFTRI'

const options = {
  hostname: '127.0.0.1',
  port: 8787,
  path: '/upload',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  }
}

let i = 0
while (i < 1000) {
  const data = `test file data ${i}`

  const req = http.request(options, (res) => {
    let data = ''

    res.on('data', (chunk) => {
      data += chunk
    })

    res.on('end', () => {
      console.log(JSON.parse(data))
    })
  }).on('error', (err) => {
    console.log('Error: ', err.message)
  })

  req.write(data)
  req.end()
  i++
}
