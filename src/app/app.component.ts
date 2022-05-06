import { Component, OnInit, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DOCUMENT } from '@angular/common';

import ZoomMtgEmbedded from '@zoomus/websdk/embedded';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  // setup your signature endpoint here: https://github.com/zoom/meetingsdk-sample-signature-node.js
  signatureEndpoint = 'https://weston-zoom.herokuapp.com/'
  // This Sample App has been updated to use SDK App type credentials https://marketplace.zoom.us/docs/guides/build/sdk-app
  sdkKey = 'hbakv7nnEYnU5DsgnpxZBEVjyOsc9ikvcq6M'
  meetingNumber = '6296099995'
  role = 0
  userName = 'Angular'
  userEmail = ''
  passWord = ''
  // pass in the registrant's token if your meeting or webinar requires registration. More info here:
  // Meetings: https://marketplace.zoom.us/docs/sdk/native-sdks/web/component-view/meetings#join-registered
  // Webinars: https://marketplace.zoom.us/docs/sdk/native-sdks/web/component-view/webinars#join-registered
  registrantToken = ''

  client = ZoomMtgEmbedded.createClient();

  constructor(public httpClient: HttpClient, @Inject(DOCUMENT) document) {

  }

  ngOnInit() {
    let meetingSDKElement = document.getElementById('meetingSDKElement');
    let meetingSDKChatElement = document.getElementById('meetingSDKChatElement');

    // ISSUE: resizing https://devforum.zoom.us/t/customize-embedded-zoom-with-component-view-in-2-2-0/64233/6?u=andy1

    this.client.init({
      debug: true,
      zoomAppRoot: meetingSDKElement,
      language: 'en-US',
      customize: {
        video: {
          popper: {
            disableDraggable: true
          },
          isResizable: true,
          viewSizes: {
            default: {
              width: 1280,
              height: 720
            },
            ribbon: {
              width: 316,
              height: 720
            }
          }
        },
        chat: {
          popper: {
            disableDraggable: true,
            anchorElement: meetingSDKChatElement,
            placement: 'top'
          }
        },
        meetingInfo: ['topic', 'host', 'mn', 'pwd', 'telPwd', 'invite', 'participant', 'dc', 'enctype'],
        toolbar: {
          buttons: [
            {
              text: 'Custom Button',
              className: 'CustomButton',
              onClick: () => {
                console.log('custom button');
              }
            }
          ]
        }
      }
    });
  }

  joinMeeting(meetingNumber, password) {
    this.passWord = password;
    this.meetingNumber = meetingNumber.replace(/ /g, "");
    this.getSignature(0);
  }

  hostMeeting(meetingNumber,password) {
    this.passWord = password;
    this.meetingNumber = meetingNumber.replace(/ /g, "");
    this.getSignature(1);
  }

  leaveMeeting() {
    this.client.leaveMeeting();
  }

  getSignature(role) {
    this.httpClient.post(this.signatureEndpoint, {
      meetingNumber: this.meetingNumber,
      role: role
    }).toPromise().then((data: any) => {
      if (data.signature) {
        console.log(data.signature)
        this.startMeeting(data.signature)
      } else {
        console.log(data)
      }
    }).catch((error) => {
      console.log(error)
    })
  }

  startMeeting(signature) {

    this.client.join({
      sdkKey: this.sdkKey,
      signature: signature,
      meetingNumber: this.meetingNumber,
      password: this.passWord,
      userName: this.userName,
      userEmail: this.userEmail,
      tk: this.registrantToken
    })
  }
}
