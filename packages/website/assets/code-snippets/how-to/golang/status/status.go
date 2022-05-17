package main

import (
	"context"
	"fmt"

	"github.com/ipfs/go-cid"
	"github.com/web3-storage/go-w3s-client"
)

//#region getStatusForCidString
func getStatusForCidString(client w3s.Client, cidString string) error {
	c, err := cid.Parse(cidString)
	if err != nil {
		return err
	}

	s, err := client.Status(context.Background(), c)
	if err != nil {
		return err
	}

	fmt.Printf("Status: %+v", s)
	return nil
}

//#endregion getStatusForCidString
