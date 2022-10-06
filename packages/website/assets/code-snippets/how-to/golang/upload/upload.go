package main

import (
	"context"
	"fmt"
	"os"
	"path"

	"github.com/web3-storage/go-w3s-client"
)

func main() {
	token, ok := os.LookupEnv("WEB3_STORAGE_TOKEN")
	if !ok {
		fmt.Fprintln(os.Stderr, "No API token - set the WEB3_STORAGE_TOKEN environment var and try again.")
		os.Exit(1)
	}

	if len(os.Args) != 2 {
		fmt.Fprintf(os.Stderr, "usage: %s <filename>\n", os.Args[0])
		os.Exit(1)
	}
	filename := os.Args[1]

	// Create a new web3.storage client using the token
	client, err := w3s.NewClient(w3s.WithToken(token))
	if err != nil {
		panic(err)
	}

	// Open the file for reading
	file, err := os.Open(filename)
	if err != nil {
		panic(err)
	}

	basename := path.Base(filename)
	// Upload to web3.storage
	fmt.Printf("Storing %s ...\n", basename)
	cid, err := client.Put(context.Background(), file)
	if err != nil {
		panic(err)
	}

	gatewayURL := fmt.Sprintf("https://%s.ipfs.dweb.link/%s\n", cid.String(), basename)
	fmt.Printf("Stored %s with web3.storage! View it at: %s\n", basename, gatewayURL)
}
